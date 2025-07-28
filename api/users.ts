import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../server/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return getUser(req, res);
  } else if (req.method === 'PUT') {
    return updateUser(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getUser(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: "User ID required" });
    }

    const user = await storage.getUser(parseInt(id as string));
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateUser(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: "User ID required" });
    }

    const updatedUser = await storage.updateUser(parseInt(id as string), req.body);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    res.status(200).json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}