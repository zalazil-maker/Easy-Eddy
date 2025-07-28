import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../../server/storage";
import { frenchJobSearchService } from "../../server/services/frenchJobSearchService";
import { WordMatchingService } from "../../server/services/wordMatchingService";
import { aiService } from "../../server/services/aiService";

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

    // Get user and check subscription
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isApproved) {
      return res.status(403).json({ error: "User not approved for job search" });
    }

    // Check subscription and daily limits
    const isSubscriptionActive = user.subscriptionStatus === 'active' && 
      (!user.subscriptionEndDate || user.subscriptionEndDate > new Date());

    if (!isSubscriptionActive || user.subscriptionTier === 'free') {
      return res.status(403).json({ 
        error: "Active subscription required for job search",
        currentTier: user.subscriptionTier
      });
    }

    // Get subscription limits
    const dailyLimits = {
      weekly: 10,
      monthly: 10,
      premium: 30
    };

    const userLimit = dailyLimits[user.subscriptionTier as keyof typeof dailyLimits] || 0;

    // Check today's usage
    const today = new Date().toISOString().split('T')[0];
    const todayApplications = await storage.getTodayApplicationCount(userId, today);

    if (todayApplications >= userLimit) {
      return res.status(429).json({ 
        error: "Daily application limit reached",
        limit: userLimit,
        used: todayApplications
      });
    }

    // Get user job criteria and CV
    const jobCriteria = await storage.getJobCriteriaByUserId(userId);
    if (!jobCriteria) {
      return res.status(400).json({ error: "Job criteria not found. Please set up your job preferences first." });
    }

    const userCV = await storage.getUserCV(userId);
    if (!userCV) {
      return res.status(400).json({ error: "CV not found. Please upload your CV first." });
    }

    // Search for jobs in French market
    console.log(`🇫🇷 Starting French job search for user ${userId}`);
    const jobs = await frenchJobSearchService.searchAllSources({
      jobTitles: jobCriteria.jobTitles,
      locations: jobCriteria.locations,
      salaryMin: jobCriteria.minSalary,
      salaryMax: jobCriteria.maxSalary,
      experienceLevel: jobCriteria.experienceLevel,
      industries: jobCriteria.industries,
      keywords: jobCriteria.keywords
    });

    let applicationsSubmitted = 0;
    const results = [];
    const remainingApplications = userLimit - todayApplications;

    for (const job of jobs) {
      if (applicationsSubmitted >= remainingApplications) {
        break;
      }

      // Calculate match score using word matching algorithm
      const matchScore = wordMatchingService.calculateJobMatch(job, userCV.content, jobCriteria);
      
      if (matchScore >= 70) { // 70% threshold for JobHackr
        try {
          // Auto-generate cover letter if user has subscription
          let coverLetter = '';
          if (['weekly', 'monthly', 'premium'].includes(user.subscriptionTier)) {
            coverLetter = await aiService.generateCoverLetter(
              job.description,
              userCV.content,
              {
                name: user.fullName || user.name || 'User',
                language: user.preferredLanguage || 'french',
                experience: user.yearsOfExperience?.toString() || 'Not specified'
              }
            );
          }

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
            jobDescription: job.description,
            jobLanguage: job.language,
            cvLanguage: user.preferredLanguage || 'french',
            coverLetter
          });

          results.push({
            job: job.title,
            company: job.company,
            location: job.location,
            matchScore,
            language: job.language,
            status: 'applied',
            coverLetterGenerated: !!coverLetter
          });

          applicationsSubmitted++;
        } catch (error) {
          console.error('Failed to submit application:', error);
          results.push({
            job: job.title,
            company: job.company,
            matchScore,
            status: 'failed',
            error: 'Application submission failed'
          });
        }
      }
    }

    // Update user's daily application count
    await storage.updateDailyApplicationCount(userId, todayApplications + applicationsSubmitted);

    const searchStats = frenchJobSearchService.getSearchStats();

    res.status(200).json({
      success: true,
      search: {
        totalJobsFound: jobs.length,
        matchingJobs: results.length,
        applicationsSubmitted,
        duplicatesRemoved: searchStats.totalJobs - searchStats.uniqueJobs
      },
      usage: {
        dailyLimit: userLimit,
        used: todayApplications + applicationsSubmitted,
        remaining: userLimit - (todayApplications + applicationsSubmitted)
      },
      subscription: {
        tier: user.subscriptionTier,
        aiFeatures: ['weekly', 'monthly', 'premium'].includes(user.subscriptionTier)
      },
      results,
      searchCompleted: new Date().toISOString()
    });

  } catch (error) {
    console.error("French job search error:", error);
    res.status(500).json({ error: "Job search failed. Please try again." });
  }
}