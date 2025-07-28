import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../server/storage";
import { WordMatchingService } from "../server/services/wordMatchingService";
import { realJobSearch } from "../server/services/realJobSearch";

const wordMatchingService = new WordMatchingService();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    // Get user and check approval
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isApproved) {
      return res.status(403).json({ error: "User not approved for job search" });
    }

    // Get user job criteria
    const jobCriteria = await storage.getJobCriteriaByUserId(userId);
    if (!jobCriteria) {
      return res.status(400).json({ error: "Job criteria not found" });
    }

    // Get user CV
    const userCV = await storage.getUserCV(userId);
    if (!userCV) {
      return res.status(400).json({ error: "CV not found" });
    }

    // Check daily application limit
    const today = new Date().toISOString().split('T')[0];
    const todayApplications = await storage.getApplicationsByUserAndDate(userId, today);
    
    const dailyLimit = jobCriteria.dailyApplicationLimit || 25;
    if (todayApplications.length >= dailyLimit) {
      return res.status(429).json({ 
        error: "Daily application limit reached",
        limit: dailyLimit,
        sent: todayApplications.length
      });
    }

    // Search for jobs
    const jobs = await realJobSearch(jobCriteria);
    let applicationsSubmitted = 0;
    const results = [];

    for (const job of jobs) {
      if (applicationsSubmitted >= (dailyLimit - todayApplications.length)) {
        break; // Stop when we reach the daily limit
      }

      // Calculate match score
      const matchScore = wordMatchingService.calculateJobMatch(job, userCV.content, jobCriteria);
      
      if (matchScore >= 70) { // 70% threshold
        try {
          // Submit application
          const application = await storage.createJobApplication({
            userId,
            jobTitle: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            jobUrl: job.url,
            matchScore,
            status: 'applied',
            appliedAt: new Date(),
            jobDescription: job.description
          });

          results.push({
            job: job.title,
            company: job.company,
            matchScore,
            status: 'applied'
          });

          applicationsSubmitted++;
        } catch (error) {
          console.error('Failed to submit application:', error);
          results.push({
            job: job.title,
            company: job.company,
            matchScore,
            status: 'failed'
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      applicationsSubmitted,
      totalJobsFound: jobs.length,
      results,
      dailyLimitReached: applicationsSubmitted >= (dailyLimit - todayApplications.length)
    });

  } catch (error) {
    console.error("Job search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}