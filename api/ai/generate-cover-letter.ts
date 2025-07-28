import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../../server/storage";
import { aiService } from "../../server/services/aiService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, jobDescription, jobTitle, company } = req.body;

    if (!userId || !jobDescription) {
      return res.status(400).json({ error: "User ID and job description required" });
    }

    // Get user and check subscription
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check subscription tier for cover letter generation
    const allowedTiers = ['weekly', 'monthly', 'premium'];
    if (!allowedTiers.includes(user.subscriptionTier)) {
      return res.status(403).json({ 
        error: "Cover letter generation requires Weekly, Monthly, or Premium subscription",
        requiredTier: "weekly",
        currentTier: user.subscriptionTier
      });
    }

    // Get user CV
    const userCV = await storage.getUserCV(userId);
    if (!userCV) {
      return res.status(400).json({ error: "User CV not found. Please upload a CV first." });
    }

    // Generate cover letter using AI
    const coverLetter = await aiService.generateCoverLetter(
      jobDescription,
      userCV.content,
      {
        name: user.name,
        language: user.preferredLanguage,
        experience: userCV.experience || 'Not specified',
        skills: userCV.skills || userCV.content.substring(0, 200)
      }
    );

    // Track usage for on-demand generation (premium tier only)
    if (req.body.onDemand && user.subscriptionTier !== 'premium') {
      return res.status(403).json({ 
        error: "On-demand cover letter generation requires Premium subscription",
        requiredTier: "premium"
      });
    }

    res.status(200).json({
      success: true,
      coverLetter,
      jobTitle: jobTitle || 'Position',
      company: company || 'Company',
      generatedAt: new Date().toISOString(),
      language: user.preferredLanguage || 'english'
    });

  } catch (error) {
    console.error("Cover letter generation error:", error);
    res.status(500).json({ error: "Failed to generate cover letter" });
  }
}