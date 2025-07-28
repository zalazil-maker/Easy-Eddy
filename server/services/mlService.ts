import OpenAI from "openai";
import type { User, JobCriteria } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class MLService {
  /**
   * Analyze CV content to extract skills, experience, and qualifications
   */
  async analyzeCVContent(cvContent: string): Promise<{
    skills: string[];
    experience: string;
    qualifications: string[];
    jobTitles: string[];
    industries: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a CV analysis expert. Analyze the CV content and extract relevant information. 
            Return your analysis in JSON format with the following structure:
            {
              "skills": ["skill1", "skill2", ...],
              "experience": "brief summary of experience level",
              "qualifications": ["qualification1", "qualification2", ...],
              "jobTitles": ["title1", "title2", ...],
              "industries": ["industry1", "industry2", ...]
            }`
          },
          {
            role: "user",
            content: `Please analyze this CV content and extract key information:\n\n${cvContent}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      return {
        skills: analysis.skills || [],
        experience: analysis.experience || "",
        qualifications: analysis.qualifications || [],
        jobTitles: analysis.jobTitles || [],
        industries: analysis.industries || []
      };
    } catch (error) {
      console.error("CV analysis error:", error);
      return {
        skills: [],
        experience: "",
        qualifications: [],
        jobTitles: [],
        industries: []
      };
    }
  }

  /**
   * Match job posting with user CV and criteria
   */
  async matchJobWithProfile(
    jobDescription: string,
    userCriteria: JobCriteria,
    cvAnalysis: any,
    userProfile: User
  ): Promise<{
    matchScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    reasoning: string;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a job matching expert. Analyze how well a job posting matches a candidate's profile.
            Consider: skills alignment, experience level, industry fit, location preferences, salary expectations.
            
            Return your analysis in JSON format:
            {
              "matchScore": 85,
              "strengths": ["Strong technical skills match", "Relevant experience"],
              "weaknesses": ["Location mismatch", "Salary below expectations"],
              "recommendations": ["Highlight React experience", "Emphasize leadership skills"],
              "reasoning": "Brief explanation of the match score"
            }`
          },
          {
            role: "user",
            content: `
            Job Description: ${jobDescription}
            
            User Criteria:
            - Job Titles: ${userCriteria.jobTitles.join(", ")}
            - Industries: ${userCriteria.industries.join(", ")}
            - Skills: ${userCriteria.skills.join(", ")}
            - Experience Level: ${userCriteria.experienceLevel}
            - Salary Range: ${userCriteria.salaryMin}-${userCriteria.salaryMax}
            - Remote Preference: ${userCriteria.remotePreference}
            
            CV Analysis:
            - Skills: ${cvAnalysis.skills.join(", ")}
            - Experience: ${cvAnalysis.experience}
            - Qualifications: ${cvAnalysis.qualifications.join(", ")}
            
            User Profile:
            - Current Role: ${userProfile.currentJobTitle}
            - Years of Experience: ${userProfile.yearsOfExperience}
            - Education: ${userProfile.educationLevel}
            - Location: ${userProfile.location}
            `
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const analysis = JSON.parse(response.choices[0].message.content || "{}");
      return {
        matchScore: Math.min(100, Math.max(0, analysis.matchScore || 0)),
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || [],
        reasoning: analysis.reasoning || ""
      };
    } catch (error) {
      console.error("Job matching error:", error);
      return {
        matchScore: 0,
        strengths: [],
        weaknesses: [],
        recommendations: [],
        reasoning: "Analysis failed"
      };
    }
  }

  /**
   * Generate personalized job search criteria based on CV and profile
   */
  async generateJobCriteria(
    cvAnalysis: any,
    userProfile: User
  ): Promise<{
    suggestedTitles: string[];
    suggestedIndustries: string[];
    suggestedSkills: string[];
    suggestedSalaryRange: { min: number; max: number };
    reasoning: string;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a career advisor. Based on a user's CV and profile, suggest optimal job search criteria.
            
            Return suggestions in JSON format:
            {
              "suggestedTitles": ["Software Engineer", "Full Stack Developer"],
              "suggestedIndustries": ["Technology", "Finance"],
              "suggestedSkills": ["React", "Node.js", "Python"],
              "suggestedSalaryRange": {"min": 70000, "max": 120000},
              "reasoning": "Based on your experience and skills..."
            }`
          },
          {
            role: "user",
            content: `
            CV Analysis:
            - Skills: ${cvAnalysis.skills.join(", ")}
            - Experience: ${cvAnalysis.experience}
            - Job Titles: ${cvAnalysis.jobTitles.join(", ")}
            - Industries: ${cvAnalysis.industries.join(", ")}
            
            User Profile:
            - Current Role: ${userProfile.currentJobTitle}
            - Years of Experience: ${userProfile.yearsOfExperience}
            - Education: ${userProfile.educationLevel}
            - Location: ${userProfile.location}
            - Age: ${userProfile.age}
            `
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const suggestions = JSON.parse(response.choices[0].message.content || "{}");
      return {
        suggestedTitles: suggestions.suggestedTitles || [],
        suggestedIndustries: suggestions.suggestedIndustries || [],
        suggestedSkills: suggestions.suggestedSkills || [],
        suggestedSalaryRange: suggestions.suggestedSalaryRange || { min: 40000, max: 80000 },
        reasoning: suggestions.reasoning || ""
      };
    } catch (error) {
      console.error("Criteria generation error:", error);
      return {
        suggestedTitles: [],
        suggestedIndustries: [],
        suggestedSkills: [],
        suggestedSalaryRange: { min: 40000, max: 80000 },
        reasoning: "Analysis failed"
      };
    }
  }

  /**
   * Optimize CV content for specific job postings
   */
  async optimizeCVForJob(
    cvContent: string,
    jobDescription: string,
    jobTitle: string
  ): Promise<{
    optimizedContent: string;
    improvements: string[];
    keywordMatches: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a CV optimization expert. Optimize a CV to better match a specific job posting.
            Keep the original content truthful but reorganize and emphasize relevant skills and experience.
            
            Return optimization in JSON format:
            {
              "optimizedContent": "The optimized CV content",
              "improvements": ["Added emphasis on relevant skills", "Reorganized experience section"],
              "keywordMatches": ["Python", "React", "Leadership"]
            }`
          },
          {
            role: "user",
            content: `
            Job Title: ${jobTitle}
            Job Description: ${jobDescription}
            
            Current CV Content:
            ${cvContent}
            
            Please optimize this CV to better match the job requirements while keeping all information truthful.
            `
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      });

      const optimization = JSON.parse(response.choices[0].message.content || "{}");
      return {
        optimizedContent: optimization.optimizedContent || cvContent,
        improvements: optimization.improvements || [],
        keywordMatches: optimization.keywordMatches || []
      };
    } catch (error) {
      console.error("CV optimization error:", error);
      return {
        optimizedContent: cvContent,
        improvements: [],
        keywordMatches: []
      };
    }
  }
}

export const mlService = new MLService();