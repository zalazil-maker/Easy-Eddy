import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage"; // your DB layer
import {
  insertUserSchema,
  insertJobCriteriaSchema,
  insertUserCVSchema,
  insertUserPreferencesSchema,
  insertSearchHistorySchema,
} from "@shared/schema";
import { searchAndApplyJobs, simulateJobResponses } from "./services/jobSearch";
import { WordMatchingService } from "./services/wordMatchingService";
import { subscriptionService } from "./services/subscriptionService";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import multer from "multer";
import path from "path";
import fs from "fs";
// import pdfParse from "pdf-parse"; // Commented out to avoid import error

const wordMatchingService = new WordMatchingService();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage_config,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2022-11-15",
});

// Helper function to validate with your schemas
async function validateSchema(schema: any, data: any) {
  try {
    await schema.parseAsync(data);
    return null;
  } catch (err: any) {
    return err.errors ? err.errors.map((e: any) => e.message).join(", ") : err.message;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Add API routes directly to app to ensure they're processed before Vite middleware
  
  // JobHackr API test endpoint
  app.get("/api/test", (req, res) => {
    res.json({ message: "JobHackr API working", timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { fullName, email, password, phone, linkedinProfile, acceptPrivacy, acceptTerms } = req.body;
      
      if (!acceptPrivacy || !acceptTerms) {
        return res.status(400).json({ message: "Privacy policy and terms acceptance required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Get IP address
      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
      
      // Create user
      const userData = {
        fullName,
        email,
        password: hashedPassword,
        phone: phone || null,
        linkedinProfile: linkedinProfile || null,
        isApproved: false,
        hasCompletedOnboarding: false,
        subscriptionTier: "free",
        lastLoginIp: ipAddress,
        privacyAcceptedAt: new Date(),
        termsAcceptedAt: new Date(),
      };

      const user = await storage.createUser(userData);
      
      // Create session
      const sessionToken = Math.random().toString(36).substring(7);
      await storage.createUserSession(user.id, ipAddress, sessionToken);

      res.json({ 
        success: true, 
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          isApproved: user.isApproved,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          subscriptionTier: user.subscriptionTier,
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get IP address and create session
      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
      const sessionToken = Math.random().toString(36).substring(7);
      await storage.createUserSession(user.id, ipAddress, sessionToken);

      res.json({ 
        success: true, 
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          isApproved: user.isApproved,
          hasCompletedOnboarding: user.hasCompletedOnboarding,
          subscriptionTier: user.subscriptionTier,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";
      const sessionToken = req.headers.authorization?.replace("Bearer ", "");
      
      const user = await storage.getUserBySession(ipAddress, sessionToken);
      if (!user) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      res.json({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isApproved: user.isApproved,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        subscriptionTier: user.subscriptionTier,
      });
    } catch (error) {
      console.error("User fetch error:", error);
      res.status(401).json({ message: "Authentication failed" });
    }
  });

  // Check subscription limits and features - direct route
  app.get("/api/subscriptions/check-limits", async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      // Mock demo user for testing
      const mockUser = {
        id: parseInt(userId as string),
        subscriptionType: 'weekly',
        subscriptionStatus: 'active',
        applicationsUsedToday: 2,
        subscriptionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
      };

      const currentTier = 'weekly'; // Demo tier
      
      // Subscription limits for JobHackr
      const SUBSCRIPTION_LIMITS: Record<string, any> = {
        free: {
          dailyApplications: 0,
          features: { 
            languageDetection: false, 
            translation: false, 
            autoCoverLetter: false, 
            onDemandCoverLetter: false, 
            cvOptimization: false 
          }
        },
        weekly: {
          dailyApplications: 10,
          features: { 
            languageDetection: true, 
            translation: true, 
            autoCoverLetter: true, 
            onDemandCoverLetter: false, 
            cvOptimization: false 
          }
        },
        monthly: {
          dailyApplications: 10,
          features: { 
            languageDetection: true, 
            translation: true, 
            autoCoverLetter: true, 
            onDemandCoverLetter: false, 
            cvOptimization: false 
          }
        },
        premium: {
          dailyApplications: 30,
          features: { 
            languageDetection: true, 
            translation: true, 
            autoCoverLetter: true, 
            onDemandCoverLetter: true, 
            cvOptimization: true 
          }
        }
      };

      const limits = SUBSCRIPTION_LIMITS[currentTier] || SUBSCRIPTION_LIMITS.free;
      const todayApplications = mockUser.applicationsUsedToday;
      const remainingApplications = Math.max(0, limits.dailyApplications - todayApplications);

      res.json({
        success: true,
        subscription: {
          tier: currentTier,
          status: mockUser.subscriptionStatus,
          isActive: true,
          expiresAt: mockUser.subscriptionEndDate
        },
        limits: {
          dailyApplications: limits.dailyApplications,
          remainingApplications,
          applicationsUsedToday: todayApplications
        },
        features: limits.features
      });

    } catch (error) {
      console.error("Check limits error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // French job search endpoint - direct route
  app.post("/api/jobs/search-french", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      // Mock successful job search results for demo
      const mockResults = {
        success: true,
        search: {
          totalJobsFound: 47,
          matchingJobs: 12,
          applicationsSubmitted: 5,
          duplicatesRemoved: 8
        },
        usage: {
          dailyLimit: 10,
          used: 7, // Updated count after search
          remaining: 3
        },
        subscription: {
          tier: 'weekly',
          aiFeatures: true
        },
        results: [
          { 
            job: "Développeur Full Stack", 
            company: "Capgemini", 
            location: "Paris", 
            matchScore: 87, 
            language: "french", 
            status: "applied", 
            coverLetterGenerated: true 
          },
          { 
            job: "Software Engineer", 
            company: "Accenture", 
            location: "Lyon", 
            matchScore: 82, 
            language: "english", 
            status: "applied", 
            coverLetterGenerated: true 
          },
          { 
            job: "Ingénieur DevOps", 
            company: "Thales", 
            location: "Toulouse", 
            matchScore: 78, 
            language: "french", 
            status: "applied", 
            coverLetterGenerated: true 
          }
        ],
        searchCompleted: new Date().toISOString()
      };

      res.json(mockResults);

    } catch (error) {
      console.error("French job search error:", error);
      res.status(500).json({ error: "Job search failed. Please try again." });
    }  
  });

  const router = express.Router();

  // --- User Signup ---
  router.post("/api/signup", async (req, res) => {
    const validationError = await validateSchema(insertUserSchema, req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    try {
      const { email, password, name } = req.body;

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Save user to DB
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        name,
        isApproved: false, // initial approval status
      });

      res.status(201).json({ success: true, userId: user.id });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- User Signin ---
  router.post("/api/signin", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      // TODO: generate session token or JWT (simplified here)
      const sessionToken = "fake-session-token"; // replace with real token logic

      res.json({
        success: true,
        user: { id: user.id, isApproved: user.isApproved, email: user.email },
        sessionToken,
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // --- Upload User CV (PDF only) ---
  router.post("/api/upload-cv", upload.single("cv"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "CV file is required" });
    }

    try {
      // Parse PDF for metadata if needed
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);

      // Save file info + text to DB (example)
      await storage.saveUserCV({
        userId: req.body.userId, // you might get userId from auth/session normally
        filePath: req.file.path,
        contentText: pdfData.text,
      });

      res.json({ success: true, message: "CV uploaded and processed" });
    } catch (error) {
      console.error("Upload CV error:", error);
      res.status(500).json({ error: "Failed to process CV" });
    }
  });

  // --- Job Search and Apply ---
  router.post("/api/search-jobs", async (req, res) => {
    const validationError = await validateSchema(insertJobCriteriaSchema, req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    try {
      const jobs = await searchAndApplyJobs(req.body);
      res.json({ success: true, jobs });
    } catch (error) {
      console.error("Job search error:", error);
      res.status(500).json({ error: "Failed to search jobs" });
    }
  });

  // --- Simulate Job Responses (for testing) ---
  router.get("/api/simulate-job-responses", async (req, res) => {
    try {
      const responses = await simulateJobResponses();
      res.json({ success: true, responses });
    } catch (error) {
      console.error("Simulation error:", error);
      res.status(500).json({ error: "Failed to simulate job responses" });
    }
  });

  // --- Stripe Subscription Endpoint ---
  router.post("/api/create-subscription", async (req, res) => {
    const { customerId, priceId } = req.body;
    if (!customerId || !priceId) {
      return res.status(400).json({ error: "Customer ID and Price ID are required" });
    }

    try {
      const subscription = await subscriptionService.createSubscription(customerId, priceId, stripe);
      res.json({ success: true, subscription });
    } catch (error) {
      console.error("Subscription creation error:", error);
      res.status(500).json({ error: "Failed to create subscription" });
    }
  });

  // Mount router on app
  app.use(router);

  // Return HTTP server instance
  return createServer(app);
}

async function initializeStripeProducts() {
  if (!stripe) return;
  
  try {
    // Check if products already exist
    const products = await stripe.products.list({ limit: 10 });
    const weeklyProduct = products.data.find(p => p.metadata?.planType === 'weekly');
    const monthlyProduct = products.data.find(p => p.metadata?.planType === 'monthly');
    
    // Create Weekly Pro product and price
    if (!weeklyProduct) {
      const weeklyProd = await stripe.products.create({
        name: 'Weekly Pro',
        description: 'For active job seekers who want daily applications',
        metadata: { planType: 'weekly' }
      });
      
      const weeklyPrice = await stripe.prices.create({
        product: weeklyProd.id,
        unit_amount: 200, // €2.00 in cents
        currency: 'eur',
        recurring: { interval: 'week' },
        metadata: { planType: 'weekly' }
      });
      
      // Update database with Stripe price ID
      await storage.updateStripePrice('weekly', weeklyPrice.id);
      console.log('✅ Created Weekly Pro product and price:', weeklyPrice.id);
    }
    
    // Create Monthly Pro product and price
    if (!monthlyProduct) {
      const monthlyProd = await stripe.products.create({
        name: 'Monthly Pro',
        description: 'Best value for serious job seekers with premium features',
        metadata: { planType: 'monthly' }
      });
      
      const monthlyPrice = await stripe.prices.create({
        product: monthlyProd.id,
        unit_amount: 499, // €4.99 in cents
        currency: 'eur',
        recurring: { interval: 'month' },
        metadata: { planType: 'monthly' }
      });
      
      // Update database with Stripe price ID
      await storage.updateStripePrice('monthly', monthlyPrice.id);
      console.log('✅ Created Monthly Pro product and price:', monthlyPrice.id);
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize Stripe products:', error);
  }

  // JobHackr AI-powered subscription API endpoints
  
  // Check subscription limits and features
  router.get("/api/subscriptions/check-limits", async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      // For demo purposes, use mock user data if user doesn't exist
      let user = await storage.getUser(parseInt(userId as string));
      let currentTier = 'weekly'; // Demo tier
      
      if (!user) {
        // Mock demo user for testing
        user = {
          id: parseInt(userId as string),
          subscriptionType: 'weekly',
          subscriptionStatus: 'active',
          applicationsUsedToday: 0,
          subscriptionEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
        } as any;
      } else {
        // Check if subscription is active
        const isSubscriptionActive = user.subscriptionStatus === 'active' && 
          (!user.subscriptionEndDate || user.subscriptionEndDate > new Date());
        currentTier = isSubscriptionActive ? user.subscriptionType : 'weekly'; // Default to weekly for demo
      }
      
      // Subscription limits for JobHackr
      const SUBSCRIPTION_LIMITS: Record<string, any> = {
        free: {
          dailyApplications: 10,
          weeklyApplications: 10,
          features: { languageDetection: true, translation: true, autoCoverLetter: true, onDemandCoverLetter: false, cvOptimization: false }
        },
        weekly: {
          dailyApplications: 10,
          features: { languageDetection: true, translation: true, autoCoverLetter: true, onDemandCoverLetter: false, cvOptimization: false }
        },
        monthly: {
          dailyApplications: 10,
          features: { languageDetection: true, translation: true, autoCoverLetter: true, onDemandCoverLetter: false, cvOptimization: false }
        },
        premium: {
          dailyApplications: 30,
          features: { languageDetection: true, translation: true, autoCoverLetter: true, onDemandCoverLetter: true, cvOptimization: true }
        }
      };

      const limits = SUBSCRIPTION_LIMITS[currentTier] || SUBSCRIPTION_LIMITS.free;

      // Mock today's usage for now
      const todayApplications = user.applicationsUsedToday || 0;
      const remainingApplications = Math.max(0, limits.dailyApplications - todayApplications);

      res.json({
        success: true,
        subscription: {
          tier: currentTier,
          status: user.subscriptionStatus || 'active',
          isActive: true, // Mock as active for demo
          expiresAt: user.subscriptionEndDate
        },
        limits: {
          dailyApplications: limits.dailyApplications,
          remainingApplications,
          applicationsUsedToday: todayApplications
        },
        features: limits.features
      });

    } catch (error) {
      console.error("Check limits error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // French job search endpoint
  router.post("/api/jobs/search-french", async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Mock successful job search results for demo
      const mockResults = {
        success: true,
        search: {
          totalJobsFound: 47,
          matchingJobs: 12,
          applicationsSubmitted: 5,
          duplicatesRemoved: 8
        },
        usage: {
          dailyLimit: 10,
          used: 5,
          remaining: 5
        },
        subscription: {
          tier: user.subscriptionType || 'weekly',
          aiFeatures: true
        },
        results: [
          { job: "Développeur Full Stack", company: "Capgemini", location: "Paris", matchScore: 87, language: "french", status: "applied", coverLetterGenerated: true },
          { job: "Software Engineer", company: "Accenture", location: "Lyon", matchScore: 82, language: "english", status: "applied", coverLetterGenerated: true },
          { job: "Ingénieur DevOps", company: "Thales", location: "Toulouse", matchScore: 78, language: "french", status: "applied", coverLetterGenerated: true }
        ],
        searchCompleted: new Date().toISOString()
      };

      res.json(mockResults);

    } catch (error) {
      console.error("French job search error:", error);
      res.status(500).json({ error: "Job search failed. Please try again." });
    }  
  });

  app.use(router);

  const httpServer = createServer(app);
  return httpServer;
}
