import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from "bcryptjs";
import { storage } from "../server/storage";
import { insertUserSchema } from "../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body
    const validationResult = insertUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: validationResult.error.errors.map(e => e.message).join(", ") 
      });
    }

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
      isApproved: false,
    });

    res.status(201).json({ success: true, userId: user.id });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}