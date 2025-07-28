// Temporarily disable transformers import for development
// import { pipeline, Pipeline } from '@xenova/transformers';
type Pipeline = any;

interface AIService {
  translateText(text: string, fromLang: string, toLang: string): Promise<string>;
  detectLanguage(text: string): Promise<string>;
  generateCoverLetter(jobDescription: string, cvContent: string, userProfile: any): Promise<string>;
  optimizeCV(cvContent: string, jobDescription: string): Promise<string>;
}

class LocalAIService implements AIService {
  private translationPipeline: Pipeline | null = null;
  private textGenerationPipeline: Pipeline | null = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      // For development, mock initialization
      // In production, this would initialize actual ML models
      this.translationPipeline = {} as Pipeline;
      this.textGenerationPipeline = {} as Pipeline;
      
      this.initialized = true;
      console.log('✅ AI Service initialized successfully (development mode)');
    } catch (error) {
      console.error('❌ Failed to initialize AI Service:', error);
      throw error;
    }
  }

  async detectLanguage(text: string): Promise<string> {
    // Simple language detection using heuristics
    const frenchWords = ['le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'pour', 'avec', 'dans', 'sur', 'par', 'sans'];
    const englishWords = ['the', 'and', 'or', 'for', 'with', 'in', 'on', 'by', 'without', 'to', 'from', 'at', 'of'];
    
    const words = text.toLowerCase().split(' ').slice(0, 50); // Check first 50 words
    
    let frenchScore = 0;
    let englishScore = 0;
    
    words.forEach(word => {
      if (frenchWords.includes(word)) frenchScore++;
      if (englishWords.includes(word)) englishScore++;
    });
    
    return frenchScore > englishScore ? 'french' : 'english';
  }

  async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    await this.initialize();
    
    if (fromLang === toLang) return text;
    
    try {
      if (!this.translationPipeline) {
        throw new Error('Translation pipeline not initialized');
      }
      
      // For development, return mock translation
      // In production, this would use the actual pipeline
      return `[${toLang.toUpperCase()}] ${text}`;
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback: return original text with a note
      return `[Translation from ${fromLang} to ${toLang}]: ${text}`;
    }
  }

  async generateCoverLetter(jobDescription: string, cvContent: string, userProfile: any): Promise<string> {
    await this.initialize();
    
    try {
      const prompt = `Write a professional cover letter in ${userProfile.language || 'English'} for this job:

Job Description: ${jobDescription.substring(0, 500)}...

Candidate Profile: ${userProfile.name}
Experience: ${userProfile.experience || 'Not specified'}
Skills: ${cvContent.substring(0, 300)}...

Generate a personalized cover letter that highlights relevant experience and shows enthusiasm for the role. Keep it concise and professional (max 250 words).

Cover Letter:`;

      // For development, return a template cover letter
      // In production, this would use the actual Phi-3-mini model
      const template = this.generateCoverLetterTemplate(userProfile, jobDescription);
      
      return template;
    } catch (error) {
      console.error('Cover letter generation error:', error);
      return this.generateCoverLetterTemplate(userProfile, jobDescription);
    }
  }

  private generateCoverLetterTemplate(userProfile: any, jobDescription: string): string {
    const company = this.extractCompanyName(jobDescription);
    const role = this.extractJobTitle(jobDescription);
    
    return `Dear Hiring Manager,

I am writing to express my strong interest in the ${role} position at ${company}. With my background in ${userProfile.experience || 'relevant field'} and passion for ${this.extractKeySkills(jobDescription)}, I am excited about the opportunity to contribute to your team.

My experience includes ${userProfile.skills || 'diverse technical and professional skills'} that align well with your requirements. I am particularly drawn to ${company}'s mission and would welcome the opportunity to discuss how my skills can benefit your organization.

Thank you for considering my application. I look forward to hearing from you.

Best regards,
${userProfile.name}`;
  }

  async optimizeCV(cvContent: string, jobDescription: string): Promise<string> {
    await this.initialize();
    
    try {
      // Extract key requirements from job description
      const keySkills = this.extractKeySkills(jobDescription);
      const requirements = this.extractRequirements(jobDescription);
      
      // For development, return optimized content based on templates
      return this.optimizeCVContent(cvContent, keySkills, requirements);
    } catch (error) {
      console.error('CV optimization error:', error);
      return cvContent; // Return original if optimization fails
    }
  }

  private extractCompanyName(jobDescription: string): string {
    // Simple extraction - in production would use NLP
    const match = jobDescription.match(/(?:at|chez)\s+([A-Z][a-zA-Z\s&]+)/i);
    return match ? match[1].trim() : 'this company';
  }

  private extractJobTitle(jobDescription: string): string {
    // Simple extraction - first line usually contains title
    const firstLine = jobDescription.split('\n')[0];
    return firstLine.length > 100 ? 'this position' : firstLine;
  }

  private extractKeySkills(jobDescription: string): string {
    const commonSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker', 'API', 'REST'];
    const foundSkills = commonSkills.filter(skill => 
      jobDescription.toLowerCase().includes(skill.toLowerCase())
    );
    return foundSkills.length > 0 ? foundSkills.join(', ') : 'technology';
  }

  private extractRequirements(jobDescription: string): string[] {
    // Simple requirement extraction
    return jobDescription.toLowerCase().includes('required') ? 
      ['experience', 'skills', 'knowledge'] : ['qualifications'];
  }

  private optimizeCVContent(cvContent: string, keySkills: string, requirements: string[]): string {
    // Simple CV optimization - highlight matching skills
    let optimized = cvContent;
    
    keySkills.split(', ').forEach(skill => {
      const regex = new RegExp(`\\b${skill}\\b`, 'gi');
      optimized = optimized.replace(regex, `**${skill}**`);
    });
    
    return optimized;
  }
}

export const aiService = new LocalAIService();