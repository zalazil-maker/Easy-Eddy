import { FRENCH_JOB_SOURCES, JobListing, jobDeduplicationService, type JobSource } from './frenchJobSources';

export interface JobSearchCriteria {
  jobTitles: string[];
  locations: string[];
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  industries?: string[];
  companyTypes?: string[];
  keywords?: string[];
}

export class FrenchJobSearchService {
  private searchHistory = new Map<string, JobListing[]>();
  
  async searchAllSources(criteria: JobSearchCriteria): Promise<JobListing[]> {
    console.log('🔍 Starting job search across French job sources...', criteria);
    
    // Clear previous deduplication data
    jobDeduplicationService.clear();
    
    const allJobs: JobListing[] = [];
    const searchPromises: Promise<JobListing[]>[] = [];
    
    // Search top priority sources first
    const prioritySources = FRENCH_JOB_SOURCES
      .filter(source => source.popularity >= 8)
      .slice(0, 5); // Limit to top 5 for performance
    
    for (const source of prioritySources) {
      searchPromises.push(this.searchJobSource(source, criteria));
    }
    
    // Execute searches in parallel
    const results = await Promise.allSettled(searchPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const jobs = result.value;
        console.log(`✅ Found ${jobs.length} jobs from ${prioritySources[index].name}`);
        
        // Deduplicate and add unique jobs
        jobs.forEach(job => {
          if (jobDeduplicationService.addJob(job)) {
            allJobs.push(job);
          }
        });
      } else {
        console.error(`❌ Failed to search ${prioritySources[index].name}:`, result.reason);
      }
    });
    
    const stats = jobDeduplicationService.getStats();
    console.log(`📊 Job search complete: ${allJobs.length} unique jobs found, ${stats.duplicatesFound} duplicates removed`);
    
    return allJobs.slice(0, 100); // Limit to 100 jobs for processing
  }
  
  private async searchJobSource(source: JobSource, criteria: JobSearchCriteria): Promise<JobListing[]> {
    try {
      // Mock job search for development
      // In production, this would implement actual API calls or web scraping
      return this.generateMockJobs(source, criteria);
    } catch (error) {
      console.error(`Error searching ${source.name}:`, error);
      return [];
    }
  }
  
  private generateMockJobs(source: JobSource, criteria: JobSearchCriteria): JobListing[] {
    const mockJobs: JobListing[] = [];
    const jobCount = Math.floor(Math.random() * 10) + 5; // 5-15 jobs per source
    
    const mockCompanies = [
      'Capgemini', 'Accenture', 'Thales', 'Orange', 'SNCF Connect', 'BNP Paribas',
      'Société Générale', 'Total Energies', 'Airbus', 'Dassault Systèmes',
      'Ubisoft', 'Criteo', 'Blablacar', 'Doctolib', 'Leboncoin'
    ];
    
    const mockLocations = [
      'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux',
      'Lille', 'Strasbourg', 'Montpellier', 'Rennes', 'Nancy', 'Grenoble'
    ];
    
    const mockBenefits = [
      'Télétravail partiel', 'Mutuelle santé', 'Tickets restaurant',
      'Formation continue', 'RTT', 'Prime annuelle', 'Congés payés'
    ];
    
    for (let i = 0; i < jobCount; i++) {
      const company = mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
      const location = mockLocations[Math.floor(Math.random() * mockLocations.length)];
      const jobTitle = criteria.jobTitles[Math.floor(Math.random() * criteria.jobTitles.length)] || 
                     'Développeur Full Stack';
      
      const job: JobListing = {
        id: `${source.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`,
        title: jobTitle,
        company,
        location,
        description: this.generateJobDescription(jobTitle, company, source.language),
        url: `${source.baseUrl}${source.searchPath}/${Math.random().toString(36).substr(2, 9)}`,
        salary: Math.random() > 0.5 ? `${30 + Math.floor(Math.random() * 40)}k-${50 + Math.floor(Math.random() * 50)}k€` : undefined,
        source: source.name,
        language: source.language,
        postedDate: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
        requirements: this.generateRequirements(jobTitle, source.language),
        benefits: mockBenefits.slice(0, Math.floor(Math.random() * 4) + 2)
      };
      
      mockJobs.push(job);
    }
    
    return mockJobs;
  }
  
  private generateJobDescription(title: string, company: string, language: 'french' | 'english'): string {
    if (language === 'french') {
      return `${company} recherche un(e) ${title} pour rejoindre notre équipe dynamique. 
      
Vous serez en charge de développer et maintenir nos applications, collaborer avec les équipes techniques, et participer à l'innovation de nos produits.

Nous offrons un environnement stimulant, des possibilités d'évolution et une rémunération attractive.

Candidatez dès maintenant pour faire partie de notre aventure technologique !`;
    } else {
      return `${company} is looking for a ${title} to join our dynamic team.

You will be responsible for developing and maintaining our applications, collaborating with technical teams, and contributing to product innovation.

We offer a stimulating environment, growth opportunities, and competitive compensation.

Apply now to be part of our technological journey!`;
    }
  }
  
  private generateRequirements(title: string, language: 'french' | 'english'): string[] {
    const techSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS'];
    const softSkills = language === 'french' 
      ? ['Esprit d\'équipe', 'Communication', 'Autonomie', 'Créativité']
      : ['Teamwork', 'Communication', 'Autonomy', 'Creativity'];
    
    const selectedTech = techSkills.slice(0, Math.floor(Math.random() * 4) + 2);
    const selectedSoft = softSkills.slice(0, Math.floor(Math.random() * 2) + 1);
    
    return [...selectedTech, ...selectedSoft];
  }
  
  async getJobsByLanguage(language: 'french' | 'english'): Promise<JobListing[]> {
    const allJobs = Array.from(this.searchHistory.values()).flat();
    return allJobs.filter(job => job.language === language);
  }
  
  getSearchStats(): { totalJobs: number, uniqueJobs: number, sources: number } {
    const allJobs = Array.from(this.searchHistory.values()).flat();
    const uniqueSources = new Set(allJobs.map(job => job.source)).size;
    
    return {
      totalJobs: allJobs.length,
      uniqueJobs: jobDeduplicationService.getStats().total,
      sources: uniqueSources
    };
  }
}

export const frenchJobSearchService = new FrenchJobSearchService();