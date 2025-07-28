import { storage } from "../storage";
import type { JobCriteria, UserPreferences, User } from "@shared/schema";

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: number;
  experienceLevel?: string;
  jobType?: string;
  industry?: string;
  remote?: boolean;
  skills?: string[];
  language: "en" | "fr";
}

interface JobMatch {
  job: JobPosting;
  matchScore: number;
  matchReasons: string[];
  shouldApply: boolean;
}

export class JobMatchingEngine {
  
  /**
   * Smart job matching using database-stored user preferences
   * No AI required - uses rule-based scoring algorithm
   */
  async matchJobsForUser(userId: number, jobs: JobPosting[]): Promise<JobMatch[]> {
    const user = await storage.getUser(userId);
    const criteria = await storage.getJobCriteria(userId);
    const preferences = await storage.getUserPreferences(userId);
    
    if (!user || !criteria) {
      throw new Error("User or job criteria not found");
    }

    const matches: JobMatch[] = [];
    
    for (const job of jobs) {
      const match = this.calculateJobMatch(job, user, criteria, preferences);
      matches.push(match);
    }

    // Sort by match score and filter based on user preferences
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .filter(match => this.shouldApplyToJob(match, preferences));
  }

  /**
   * Rule-based job matching algorithm
   * Uses stored user data for intelligent scoring
   */
  private calculateJobMatch(
    job: JobPosting, 
    user: User, 
    criteria: JobCriteria, 
    preferences?: UserPreferences
  ): JobMatch {
    let score = 0;
    const reasons: string[] = [];
    const maxScore = 100;

    // 1. Language Matching (25 points) - Critical filter
    if (user.spokenLanguages?.includes(job.language)) {
      score += 25;
      reasons.push(`Language match: ${job.language.toUpperCase()}`);
    } else {
      // If language doesn't match, score heavily penalized
      score -= 50;
      reasons.push(`Language mismatch: Job requires ${job.language.toUpperCase()}`);
    }

    // 2. Job Title Matching (20 points)
    const titleMatch = this.calculateTitleMatch(job.title, criteria.jobTitles);
    score += titleMatch.score;
    if (titleMatch.matched) {
      reasons.push(`Title match: ${titleMatch.matchedTitle}`);
    }

    // 3. Location Matching (15 points)
    const locationMatch = this.calculateLocationMatch(job, criteria);
    score += locationMatch.score;
    if (locationMatch.matched) {
      reasons.push(`Location match: ${locationMatch.reason}`);
    }

    // 4. Experience Level Matching (15 points)
    if (this.matchesExperience(job.experienceLevel, criteria.experienceLevel, user.yearsOfExperience)) {
      score += 15;
      reasons.push(`Experience level match`);
    }

    // 5. Skills Matching (10 points)
    const skillsMatch = this.calculateSkillsMatch(job.skills || [], criteria.skills || []);
    score += skillsMatch.score;
    if (skillsMatch.matchedSkills.length > 0) {
      reasons.push(`Skills match: ${skillsMatch.matchedSkills.join(", ")}`);
    }

    // 6. Industry Matching (5 points)
    if (criteria.industries?.includes(job.industry || "")) {
      score += 5;
      reasons.push(`Industry match: ${job.industry}`);
    }

    // 7. Salary Matching (5 points)
    if (this.matchesSalary(job.salary, criteria.salaryMin, criteria.salaryMax)) {
      score += 5;
      reasons.push(`Salary within range`);
    }

    // 8. Company Preferences (5 points)
    const companyBonus = this.calculateCompanyScore(job.company, preferences);
    score += companyBonus.score;
    if (companyBonus.reason) {
      reasons.push(companyBonus.reason);
    }

    // Normalize score to 0-100
    const finalScore = Math.max(0, Math.min(100, score));

    return {
      job,
      matchScore: finalScore,
      matchReasons: reasons,
      shouldApply: finalScore >= (preferences?.minMatchScore || 70)
    };
  }

  /**
   * Job title matching using string similarity and keyword matching
   */
  private calculateTitleMatch(jobTitle: string, userTitles: string[]): { score: number; matched: boolean; matchedTitle?: string } {
    const jobTitleLower = jobTitle.toLowerCase();
    
    for (const userTitle of userTitles) {
      const userTitleLower = userTitle.toLowerCase();
      
      // Exact match
      if (jobTitleLower === userTitleLower) {
        return { score: 20, matched: true, matchedTitle: userTitle };
      }
      
      // Partial match - contains keywords
      if (jobTitleLower.includes(userTitleLower) || userTitleLower.includes(jobTitleLower)) {
        return { score: 15, matched: true, matchedTitle: userTitle };
      }
      
      // Keyword similarity
      const jobWords = jobTitleLower.split(/\s+/);
      const userWords = userTitleLower.split(/\s+/);
      const commonWords = jobWords.filter(word => userWords.includes(word));
      
      if (commonWords.length >= 1) {
        return { score: 10, matched: true, matchedTitle: userTitle };
      }
    }
    
    return { score: 0, matched: false };
  }

  /**
   * Location matching with remote work consideration
   */
  private calculateLocationMatch(job: JobPosting, criteria: JobCriteria): { score: number; matched: boolean; reason?: string } {
    // Remote work preference
    if (job.remote && criteria.remotePreference === "remote-only") {
      return { score: 15, matched: true, reason: "Remote position" };
    }
    
    if (criteria.remotePreference === "remote-only" && !job.remote) {
      return { score: 0, matched: false };
    }

    // Location matching
    const jobLocationLower = job.location.toLowerCase();
    
    for (const userLocation of criteria.locations) {
      const userLocationLower = userLocation.toLowerCase();
      
      if (jobLocationLower.includes(userLocationLower) || userLocationLower.includes(jobLocationLower)) {
        return { score: 15, matched: true, reason: `Location: ${job.location}` };
      }
    }

    // Willing to relocate
    if (criteria.willingToRelocate) {
      return { score: 8, matched: true, reason: "Open to relocation" };
    }

    return { score: 0, matched: false };
  }

  /**
   * Experience level matching with user's years of experience
   */
  private matchesExperience(jobLevel?: string, userLevel?: string, userYears?: number): boolean {
    if (!jobLevel || !userLevel) return true; // Default to match if not specified
    
    const experienceLevels = {
      "entry": { min: 0, max: 2 },
      "mid": { min: 2, max: 5 },
      "senior": { min: 5, max: 10 },
      "lead": { min: 8, max: 15 },
      "executive": { min: 12, max: 30 }
    };
    
    const jobRange = experienceLevels[jobLevel as keyof typeof experienceLevels];
    const userRange = experienceLevels[userLevel as keyof typeof experienceLevels];
    
    if (!jobRange || !userRange) return true;
    
    // Check if user's experience years fall within job requirements
    if (userYears !== undefined) {
      return userYears >= jobRange.min && userYears <= jobRange.max + 2; // Allow slight overshoot
    }
    
    // Fallback to level comparison
    return userRange.min <= jobRange.max && userRange.max >= jobRange.min;
  }

  /**
   * Skills matching using keyword overlap
   */
  private calculateSkillsMatch(jobSkills: string[], userSkills: string[]): { score: number; matchedSkills: string[] } {
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());
    const userSkillsLower = userSkills.map(s => s.toLowerCase());
    
    const matchedSkills = userSkillsLower.filter(skill => 
      jobSkillsLower.some(jobSkill => 
        jobSkill.includes(skill) || skill.includes(jobSkill)
      )
    );
    
    if (matchedSkills.length === 0) return { score: 0, matchedSkills: [] };
    
    // Score based on percentage of matched skills
    const matchPercentage = matchedSkills.length / Math.max(jobSkills.length, userSkills.length);
    const score = Math.round(matchPercentage * 10);
    
    return { score, matchedSkills };
  }

  /**
   * Salary range matching
   */
  private matchesSalary(jobSalary?: number, userMin?: number, userMax?: number): boolean {
    if (!jobSalary || (!userMin && !userMax)) return true;
    
    if (userMin && jobSalary < userMin) return false;
    if (userMax && jobSalary > userMax) return false;
    
    return true;
  }

  /**
   * Company preferences scoring
   */
  private calculateCompanyScore(company: string, preferences?: UserPreferences): { score: number; reason?: string } {
    if (!preferences) return { score: 0 };
    
    const companyLower = company.toLowerCase();
    
    // Check excluded companies
    if (preferences.excludedCompanies?.some(excluded => 
      companyLower.includes(excluded.toLowerCase())
    )) {
      return { score: -20, reason: "Excluded company" };
    }
    
    // Check priority companies
    if (preferences.priorityCompanies?.some(priority => 
      companyLower.includes(priority.toLowerCase())
    )) {
      return { score: 10, reason: "Priority company" };
    }
    
    return { score: 0 };
  }

  /**
   * Determine if user should apply to job based on preferences
   */
  private shouldApplyToJob(match: JobMatch, preferences?: UserPreferences): boolean {
    const minScore = preferences?.minMatchScore || 70;
    
    // Must meet minimum match score
    if (match.matchScore < minScore) return false;
    
    // Must not be excluded company
    if (match.matchReasons.includes("Excluded company")) return false;
    
    // Language mismatch is a blocker
    if (match.matchReasons.some(reason => reason.includes("Language mismatch"))) return false;
    
    return true;
  }

  /**
   * Apply smart filtering based on user search strategy
   */
  async getJobsToApply(userId: number, availableJobs: JobPosting[]): Promise<JobMatch[]> {
    const preferences = await storage.getUserPreferences(userId);
    const matches = await this.matchJobsForUser(userId, availableJobs);
    
    // Filter jobs that should be applied to
    const eligibleJobs = matches.filter(match => match.shouldApply);
    
    // Apply daily limit
    const dailyLimit = preferences?.maxApplicationsPerDay || 25;
    
    // Prioritize based on search strategy
    if (preferences?.aggressiveSearch) {
      // Aggressive: Lower threshold, more applications
      return eligibleJobs
        .filter(match => match.matchScore >= 60)
        .slice(0, dailyLimit);
    } else {
      // Conservative: Higher threshold, fewer but better matches
      return eligibleJobs
        .filter(match => match.matchScore >= (preferences?.minMatchScore || 70))
        .slice(0, dailyLimit);
    }
  }
}

export const jobMatchingEngine = new JobMatchingEngine();