import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

console.log(`${new Date().toLocaleTimeString()} [startup] Starting server initialization...`);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize routes (includes API routes and database setup)
try {
  console.log(`${new Date().toLocaleTimeString()} [startup] Setting up routes and database...`);
  const httpServer = await registerRoutes(app);
  
  // Health check endpoint (before Vite middleware)
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  });
  
  // Serve built React frontend in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    console.log(`${new Date().toLocaleTimeString()} [startup] Serving production build...`);
    // Serve static files from the built client
    app.use(express.static(path.join(__dirname, "..", "client", "dist")));
    
    // Handle React routing - serve index.html for all non-API routes
    app.get("*", (req, res) => {
      if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
      } else {
        res.status(404).json({ error: "API endpoint not found" });
      }
    });
  } else {
    console.log(`${new Date().toLocaleTimeString()} [startup] Setting up Vite for development...`);
    // Add a catch-all handler for non-API routes before Vite
    app.get("*", (req, res, next) => {
      // Only handle non-API routes with Vite
      if (req.path.startsWith('/api/') || req.path.startsWith('/admin')) {
        return next(); // Let API routes be handled normally
      }
      // For all other routes, let Vite handle them
      next();
    });
    
    // In development, let Vite handle the frontend
    try {
      const viteModule = await import("./vite.js");
      await viteModule.setupVite(app, httpServer);
    } catch (error) {
      console.error("Failed to setup Vite dev server:", error);
      // Fallback: serve static files if Vite setup fails
      app.use(express.static(path.join(__dirname, "..", "client", "dist")));
      app.get("*", (req, res) => {
        if (!req.path.startsWith('/api')) {
          res.sendFile(path.join(__dirname, "..", "client", "dist", "index.html"));
        }
      });
    }
  }

  // Health check already added above

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`${new Date().toLocaleTimeString()} [startup] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`${new Date().toLocaleTimeString()} [startup] Health check available at /health`);
  });

} catch (error) {
  console.error(`${new Date().toLocaleTimeString()} [startup] Failed to initialize server:`, error);
  process.exit(1);
}