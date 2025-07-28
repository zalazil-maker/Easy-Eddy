import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../server/storage";
import { insertJobCriteriaSchema } from "../shared/schema";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    return createJobCriteria(req, res);
  } else if (req.method === 'GET') {
    return getJobCriteria(req, res);
  } else if (req.method === 'PUT') {
    return updateJobCriteria(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function createJobCriteria(req: VercelRequest, res: VercelResponse) {
  try {
    const validationResult = insertJobCriteriaSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: validationResult.error.errors.map(e => e.message).join(", ") 
      });
    }

    const jobCriteria = await storage.createJobCriteria(req.body);
    res.status(201).json({ success: true, jobCriteria });
  } catch (error) {
    console.error("Create job criteria error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getJobCriteria(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const jobCriteria = await storage.getJobCriteriaByUserId(parseInt(userId as string));
    if (!jobCriteria) {
      return res.status(404).json({ error: "Job criteria not found" });
    }

    res.status(200).json(jobCriteria);
  } catch (error) {
    console.error("Get job criteria error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateJobCriteria(req: VercelRequest, res: VercelResponse) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: "Job criteria ID required" });
    }

    const jobCriteria = await storage.updateJobCriteria(parseInt(id as string), req.body);
    res.status(200).json({ success: true, jobCriteria });
  } catch (error) {
    console.error("Update job criteria error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}