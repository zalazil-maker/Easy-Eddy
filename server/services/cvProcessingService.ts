import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { WordMatchingService } from './wordMatchingService';

const wordMatchingService = new WordMatchingService();

/**
 * Production-ready CV processing service
 * Handles PDF parsing, content extraction, and skill analysis
 */
export class CVProcessingService {
  
  /**
   * Process uploaded CV file and extract meaningful content
   */
  async processUploadedCV(filePath: string): Promise<{
    content: string;
    analysis: any;
    skills: string[];
    experience: string;
    jobTitles: string[];
  }> {
    try {
      // Read and parse PDF
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      
      const content = this.cleanExtractedText(pdfData.text);
      
      // Analyze CV content with word matching
      const analysis = await wordMatchingService.analyzeCVContent(content);
      
      // Extract additional structured data
      const skills = this.extractSkills(content);
      const experience = this.extractExperience(content);
      const jobTitles = this.extractJobTitles(content);
      
      console.log(`📄 CV processed: ${skills.length} skills, ${experience}, ${jobTitles.length} job titles`);
      
      return {
        content,
        analysis,
        skills,
        experience,
        jobTitles
      };
      
    } catch (error) {
      console.error('Error processing CV:', error);
      throw new Error(`Failed to process CV: ${error.message}`);
    }
  }

  /**
   * Clean and normalize extracted text
   */
  private cleanExtractedText(text: string): string {
    return text
      .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
      .replace(/\s{2,}/g, ' ') // Reduce multiple spaces
      .replace(/[^\w\s\n.,;:()\-+/@#$%&*]/g, '') // Remove special characters
      .trim();
  }

  /**
   * Extract skills from CV content
   */
  private extractSkills(content: string): string[] {
    const skillKeywords = [
      // Programming Languages
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
      
      // Web Technologies
      'React', 'Angular', 'Vue.js', 'Node.js', 'Express', 'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind',
      
      // Databases
      'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'DynamoDB', 'Cassandra',
      
      // Cloud & DevOps
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'CI/CD',
      
      // Mobile Development
      'React Native', 'Flutter', 'iOS', 'Android', 'Xamarin', 'Ionic',
      
      // Data Science & AI
      'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
      
      // Testing & Quality
      'Jest', 'Mocha', 'Cypress', 'Selenium', 'Unit Testing', 'Integration Testing', 'TDD', 'BDD',
      
      // Other Technologies
      'GraphQL', 'REST API', 'Microservices', 'Agile', 'Scrum', 'Kanban', 'JIRA', 'Confluence'
    ];
    
    const foundSkills = [];
    const contentLower = content.toLowerCase();
    
    for (const skill of skillKeywords) {
      if (contentLower.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }
    
    return foundSkills;
  }

  /**
   * Extract experience level from CV content
   */
  private extractExperience(content: string): string {
    const contentLower = content.toLowerCase();
    
    // Look for explicit years mentioned
    const yearMatches = content.match(/(\d+)[\s-]*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|work)/gi);
    if (yearMatches) {
      const years = yearMatches.map(match => {
        const yearMatch = match.match(/\d+/);
        return yearMatch ? parseInt(yearMatch[0]) : 0;
      });
      const maxYears = Math.max(...years);
      
      if (maxYears >= 7) return 'Senior (7+ years)';
      if (maxYears >= 3) return 'Mid-level (3-7 years)';
      if (maxYears >= 1) return 'Junior (1-3 years)';
    }
    
    // Look for experience indicators
    if (contentLower.includes('senior') || contentLower.includes('lead') || contentLower.includes('principal')) {
      return 'Senior Level';
    }
    
    if (contentLower.includes('mid') || contentLower.includes('intermediate')) {
      return 'Mid-level';
    }
    
    if (contentLower.includes('junior') || contentLower.includes('entry') || contentLower.includes('graduate')) {
      return 'Entry Level';
    }
    
    return 'Mid-level';
  }

  /**
   * Extract job titles from CV content
   */
  private extractJobTitles(content: string): string[] {
    const jobTitlePatterns = [
      /software\s+(?:engineer|developer|architect)/gi,
      /frontend\s+(?:engineer|developer)/gi,
      /backend\s+(?:engineer|developer)/gi,
      /full\s*stack\s+(?:engineer|developer)/gi,
      /web\s+developer/gi,
      /mobile\s+developer/gi,
      /devops\s+engineer/gi,
      /data\s+(?:scientist|engineer|analyst)/gi,
      /product\s+manager/gi,
      /project\s+manager/gi,
      /technical\s+lead/gi,
      /team\s+lead/gi,
      /engineering\s+manager/gi,
      /ui\/ux\s+designer/gi,
      /quality\s+assurance/gi,
      /software\s+tester/gi
    ];
    
    const foundTitles = [];
    
    for (const pattern of jobTitlePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        foundTitles.push(...matches.map(match => match.trim()));
      }
    }
    
    // Remove duplicates and normalize
    return [...new Set(foundTitles)].map(title => 
      title.replace(/\s+/g, ' ').toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    );
  }

  /**
   * Validate CV content quality
   */
  validateCVContent(content: string): {
    isValid: boolean;
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues = [];
    const suggestions = [];
    let score = 0;
    
    // Check content length
    if (content.length < 500) {
      issues.push('CV content is too short');
      suggestions.push('Add more details about your experience and skills');
    } else {
      score += 20;
    }
    
    // Check for contact information
    if (content.includes('@') || content.includes('email')) {
      score += 10;
    } else {
      issues.push('No contact information found');
      suggestions.push('Include your email address');
    }
    
    // Check for skills
    const skills = this.extractSkills(content);
    if (skills.length >= 5) {
      score += 30;
    } else {
      issues.push('Limited technical skills mentioned');
      suggestions.push('List more specific technical skills');
    }
    
    // Check for experience
    if (content.toLowerCase().includes('experience') || content.toLowerCase().includes('worked')) {
      score += 25;
    } else {
      issues.push('No work experience mentioned');
      suggestions.push('Include your work experience');
    }
    
    // Check for education
    if (content.toLowerCase().includes('education') || content.toLowerCase().includes('degree')) {
      score += 15;
    } else {
      suggestions.push('Consider adding your educational background');
    }
    
    return {
      isValid: score >= 50,
      score,
      issues,
      suggestions
    };
  }

  /**
   * Generate CV improvement suggestions
   */
  generateImprovementSuggestions(content: string): string[] {
    const suggestions = [];
    const contentLower = content.toLowerCase();
    
    // Check for quantified achievements
    if (!/\d+%|\d+x|\$\d+|\d+\s*(?:million|thousand|users|clients)/i.test(content)) {
      suggestions.push('Add quantified achievements (e.g., "Improved performance by 30%", "Managed team of 5 developers")');
    }
    
    // Check for action verbs
    const actionVerbs = ['developed', 'implemented', 'designed', 'led', 'managed', 'created', 'built', 'optimized'];
    const hasActionVerbs = actionVerbs.some(verb => contentLower.includes(verb));
    if (!hasActionVerbs) {
      suggestions.push('Use strong action verbs to describe your accomplishments');
    }
    
    // Check for modern technologies
    const modernTech = ['cloud', 'microservices', 'api', 'agile', 'devops', 'ci/cd'];
    const hasModernTech = modernTech.some(tech => contentLower.includes(tech));
    if (!hasModernTech) {
      suggestions.push('Mention modern technologies and methodologies you have experience with');
    }
    
    // Check for soft skills
    const softSkills = ['leadership', 'communication', 'teamwork', 'problem-solving'];
    const hasSoftSkills = softSkills.some(skill => contentLower.includes(skill));
    if (!hasSoftSkills) {
      suggestions.push('Include relevant soft skills like leadership, communication, or teamwork');
    }
    
    return suggestions;
  }
}

// Export singleton instance
export const cvProcessingService = new CVProcessingService();