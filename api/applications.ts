import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../server/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, page = '1', limit = '20' } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const applications = await storage.getJobApplicationsByUserId(
      parseInt(userId as string),
      limitNum,
      offset
    );

    // Get total count for pagination
    const totalApplications = await storage.getTotalApplicationsByUserId(parseInt(userId as string));

    res.status(200).json({
      applications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalApplications,
        totalPages: Math.ceil(totalApplications / limitNum)
      }
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}