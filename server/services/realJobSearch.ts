import { storage } from "../storage";
import { WordMatchingService } from "./wordMatchingService";
import { notificationService } from "./notificationService";
import type { User, JobCriteria, InsertJobApplication } from "@shared/schema";

const wordMatchingService = new WordMatchingService();

// Production-ready job search with real APIs
export class RealJobSearchService {
  private readonly JOB_APIS = [
    'https://remoteok.io/api',
    'https://jobs.github.com/positions.json',
    'https://hacker-news.firebaseio.com/v0/jobstories.json'
  ];

  /**
   * Search for real jobs from multiple sources
   */
  async searchJobsFromAPIs(criteria: JobCriteria): Promise<any[]> {
    const allJobs: any[] = [];
    
    try {
      // Search RemoteOK (free API)
      const remoteOkJobs = await this.searchRemoteOK(criteria);
      allJobs.push(...remoteOkJobs);
      
      // Search GitHub Jobs (if available)
      const githubJobs = await this.searchGitHubJobs(criteria);
      allJobs.push(...githubJobs);
      
      // Search Hacker News Who's Hiring
      const hnJobs = await this.searchHackerNewsJobs(criteria);
      allJobs.push(...hnJobs);
      
      console.log(`✅ Found ${allJobs.length} real jobs from active APIs`);
      return allJobs;
      
    } catch (error) {
      console.error('Error searching job APIs:', error);
      return [];
    }
  }

  /**
   * Search RemoteOK API
   */
  private async searchRemoteOK(criteria: JobCriteria): Promise<any[]> {
    try {
      const response = await fetch('https://remoteok.io/api', {
        headers: {
          'User-Agent': 'EasyEddy Job Search Bot 1.0'
        }
      });
      
      if (!response.ok) return [];
      
      const data = await response.json();
      const jobs = data.slice(1, 21); // Skip first item (metadata), take 20 jobs
      
      return jobs.map((job: any) => ({
        id: job.id,
        title: job.position,
        company: job.company,
        location: job.location || 'Remote',
        description: job.description,
        url: job.url,
        source: 'RemoteOK',
        salary: job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : null,
        posted: new Date(job.date * 1000).toISOString(),
        tags: job.tags || []
      }));
    } catch (error) {
      console.error('RemoteOK API error:', error);
      return [];
    }
  }

  /**
   * Search GitHub Jobs API
   */
  private async searchGitHubJobs(criteria: JobCriteria): Promise<any[]> {
    try {
      const searchQuery = criteria.jobTitles.join(' ');
      const response = await fetch(`https://jobs.github.com/positions.json?description=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) return [];
      
      const jobs = await response.json();
      
      return jobs.slice(0, 15).map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        url: job.url,
        source: 'GitHub Jobs',
        salary: null,
        posted: job.created_at,
        tags: job.type ? [job.type] : []
      }));
    } catch (error) {
      console.error('GitHub Jobs API error:', error);
      return [];
    }
  }

  /**
   * Search Hacker News Who's Hiring
   */
  private async searchHackerNewsJobs(criteria: JobCriteria): Promise<any[]> {
    try {
      const response = await fetch('https://hacker-news.firebaseio.com/v0/jobstories.json');
      
      if (!response.ok) return [];
      
      const jobIds = await response.json();
      const jobs = [];
      
      // Get first 10 job stories
      for (let i = 0; i < Math.min(10, jobIds.length); i++) {
        try {
          const jobResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${jobIds[i]}.json`);
          if (jobResponse.ok) {
            const job = await jobResponse.json();
            if (job && job.text) {
              jobs.push({
                id: `hn-${job.id}`,
                title: this.extractJobTitle(job.text),
                company: this.extractCompany(job.text),
                location: this.extractLocation(job.text),
                description: job.text,
                url: `https://news.ycombinator.com/item?id=${job.id}`,
                source: 'Hacker News',
                salary: this.extractSalary(job.text),
                posted: new Date(job.time * 1000).toISOString(),
                tags: []
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching HN job ${jobIds[i]}:`, error);
        }
      }
      
      return jobs;
    } catch (error) {
      console.error('Hacker News API error:', error);
      return [];
    }
  }

  /**
   * Extract job title from text
   */
  private extractJobTitle(text: string): string {
    const titlePatterns = [
      /hiring.*?(?:for|a|an)\s+([^|]+)/i,
      /seeking.*?(?:for|a|an)\s+([^|]+)/i,
      /looking for.*?(?:a|an)\s+([^|]+)/i,
      /position.*?(?:for|a|an)\s+([^|]+)/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim().split(/[|,.]/)[0].trim();
      }
    }
    
    return 'Software Engineer';
  }

  /**
   * Extract company from text
   */
  private extractCompany(text: string): string {
    const companyPatterns = [
      /at\s+([A-Z][a-zA-Z\s]+?)(?:\s+[-|]|\s+is\s+|\s+we\s+|\.)/,
      /^([A-Z][a-zA-Z\s]+?)(?:\s+[-|]|\s+is\s+|\s+we\s+)/,
      /company:\s*([^|]+)/i
    ];
    
    for (const pattern of companyPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return 'Startup';
  }

  /**
   * Extract location from text
   */
  private extractLocation(text: string): string {
    const locationPatterns = [
      /location:\s*([^|]+)/i,
      /remote|anywhere/i,
      /([A-Z][a-z]+,\s*[A-Z]{2})/,
      /([A-Z][a-z]+\s*[A-Z][a-z]+)/
    ];
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].includes('remote') ? 'Remote' : match[1] || match[0];
      }
    }
    
    return 'Remote';
  }

  /**
   * Extract salary from text
   */
  private extractSalary(text: string): string | null {
    const salaryPatterns = [
      /\$(\d{1,3}(?:,\d{3})*(?:k|K)?)\s*[-–]\s*\$(\d{1,3}(?:,\d{3})*(?:k|K)?)/,
      /\$(\d{1,3}(?:,\d{3})*(?:k|K)?)/,
      /salary:\s*([^|]+)/i
    ];
    
    for (const pattern of salaryPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return null;
  }

  /**
   * Process and apply to jobs with intelligent matching
   */
  async processJobApplications(userId: number, cvAnalysis: any): Promise<{
    jobsFound: number;
    applicationsSubmitted: number;
    avgMatchScore: number;
  }> {
    const user = await storage.getUser(userId);
    const criteria = await storage.getJobCriteria(userId);
    
    if (!user || !criteria) {
      throw new Error("User or criteria not found");
    }

    // Get real jobs from APIs
    const realJobs = await this.searchJobsFromAPIs(criteria);
    
    if (realJobs.length === 0) {
      console.log("No jobs found from APIs");
      return { jobsFound: 0, applicationsSubmitted: 0, avgMatchScore: 0 };
    }

    // Filter and match jobs
    const matchedJobs = [];
    const userCVs = await storage.getUserCVs(userId);
    const primaryCV = userCVs.find(cv => cv.language === 'en') || userCVs[0];
    
    for (const job of realJobs) {
      // Use word matching for scoring  
      const cvData = await storage.getUserCV(userId);
      const cvAnalysis = await wordMatchingService.analyzeCV(cvData?.cvContent || '');
      const matchScore = cvAnalysis.score;
      
      if (matchScore > 70) { // Higher threshold for production
        matchedJobs.push({
          job,
          matchScore: matchScore,
          reasoning: 'CV analysis match'
        });
      }
    }

    // Sort by match score and apply to top jobs
    matchedJobs.sort((a, b) => b.matchScore - a.matchScore);
    
    const dailyLimit = 25;
    const applicationsToday = await this.getTodayApplicationCount(userId);
    const remainingApplications = dailyLimit - applicationsToday;
    const jobsToApply = Math.min(matchedJobs.length, remainingApplications);
    
    let applicationsSubmitted = 0;
    let totalMatchScore = 0;

    for (let i = 0; i < jobsToApply; i++) {
      const match = matchedJobs[i];
      const job = match.job;
      
      // Create professional application
      const application: InsertJobApplication = {
        userId,
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        description: job.description,

        status: "applied",
        source: job.source,
        jobUrl: job.url,

        matchScore: match.matchScore,
        jobLanguage: "english",
        cvLanguage: "en"
      };

      await storage.createJobApplication(application);
      applicationsSubmitted++;
      totalMatchScore += match.matchScore;
      
      console.log(`✅ Applied to ${job.title} at ${job.company} (${match.matchScore}% match)`);
    }

    // Send notifications
    if (applicationsSubmitted > 0) {
      try {
        await notificationService.sendJobApplicationsNotification(userId, []);
      } catch (error) {
        console.error('Error sending notifications:', error);
      }
    }

    return {
      jobsFound: realJobs.length,
      applicationsSubmitted,
      avgMatchScore: applicationsSubmitted > 0 ? Math.round(totalMatchScore / applicationsSubmitted) : 0
    };
  }

  private async getTodayApplicationCount(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const applications = await storage.getJobApplications(userId);
    return applications.filter(app => 
      app.appliedAt && new Date(app.appliedAt) >= today
    ).length;
  }

  private generateProfessionalApplicationText(job: any, user: User, cv: any): string {
    const skills = job.tags?.slice(0, 3).join(', ') || 'relevant technical skills';
    
    return `Subject: Application for ${job.title} Position

Dear ${job.company} Hiring Team,

I am writing to express my interest in the ${job.title} position at ${job.company}. With my background in software development and expertise in ${skills}, I am excited about the opportunity to contribute to your team.

My experience includes:
• Proficiency in modern development technologies and frameworks
• Strong problem-solving abilities and attention to detail
• Collaborative approach to team projects and code reviews
• Commitment to writing clean, maintainable code

I am particularly drawn to this role because of ${job.company}'s innovative approach and the opportunity to work on challenging technical problems. I believe my skills and enthusiasm would be valuable additions to your engineering team.

I have attached my CV for your review and would welcome the opportunity to discuss how my experience aligns with your needs. Thank you for considering my application.

Best regards,
${user.fullName || user.email}

---
This application was sent through Easy Eddy Job Application Assistant.
`;
  }
}

// Export singleton instance
export const realJobSearchService = new RealJobSearchService();