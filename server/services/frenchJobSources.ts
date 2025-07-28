// Top 30 French job websites for JobHackr
export interface JobSource {
  name: string;
  baseUrl: string;
  searchPath: string;
  language: 'french' | 'english';
  popularity: number; // 1-10 scale
  apiAvailable: boolean;
}

export const FRENCH_JOB_SOURCES: JobSource[] = [
  // Major French job boards
  { name: "Indeed France", baseUrl: "https://fr.indeed.com", searchPath: "/jobs", language: "french", popularity: 10, apiAvailable: true },
  { name: "LinkedIn France", baseUrl: "https://linkedin.com", searchPath: "/jobs/search", language: "french", popularity: 10, apiAvailable: true },
  { name: "Pôle Emploi", baseUrl: "https://pole-emploi.fr", searchPath: "/offres/recherche", language: "french", popularity: 9, apiAvailable: true },
  { name: "Monster France", baseUrl: "https://monster.fr", searchPath: "/emploi/recherche", language: "french", popularity: 8, apiAvailable: false },
  { name: "StepStone France", baseUrl: "https://stepstone.fr", searchPath: "/offres-emploi", language: "french", popularity: 8, apiAvailable: false },
  
  // Specialized French platforms
  { name: "Apec", baseUrl: "https://apec.fr", searchPath: "/offres-emploi", language: "french", popularity: 9, apiAvailable: false },
  { name: "Cadremploi", baseUrl: "https://cadremploi.fr", searchPath: "/offres", language: "french", popularity: 8, apiAvailable: false },
  { name: "RegionsJob", baseUrl: "https://regionsjob.com", searchPath: "/offres", language: "french", popularity: 7, apiAvailable: false },
  { name: "Keljob", baseUrl: "https://keljob.com", searchPath: "/offres-emploi", language: "french", popularity: 7, apiAvailable: false },
  { name: "JobTeaser", baseUrl: "https://jobteaser.com", searchPath: "/jobs", language: "french", popularity: 7, apiAvailable: false },
  
  // Tech-focused French boards
  { name: "Welovedevs", baseUrl: "https://welovedevs.com", searchPath: "/jobs", language: "french", popularity: 6, apiAvailable: false },
  { name: "Freelance.com", baseUrl: "https://freelance.com", searchPath: "/projets", language: "french", popularity: 6, apiAvailable: false },
  { name: "LesJeudis", baseUrl: "https://lesjeudis.com", searchPath: "/emploi", language: "french", popularity: 6, apiAvailable: false },
  { name: "FrenchTech Jobs", baseUrl: "https://jobs.frenchtech.org", searchPath: "/jobs", language: "french", popularity: 6, apiAvailable: false },
  { name: "Choose Your Boss", baseUrl: "https://chooseyourboss.com", searchPath: "/jobs", language: "french", popularity: 5, apiAvailable: false },
  
  // Startup-focused platforms
  { name: "TheFamily Jobs", baseUrl: "https://jobs.thefamily.co", searchPath: "/", language: "french", popularity: 5, apiAvailable: false },
  { name: "Angel.co France", baseUrl: "https://angel.co", searchPath: "/jobs", language: "english", popularity: 5, apiAvailable: true },
  { name: "Startup.jobs", baseUrl: "https://startup.jobs", searchPath: "/france", language: "english", popularity: 5, apiAvailable: false },
  
  // Regional and niche boards
  { name: "Emploi Store", baseUrl: "https://www.emploi-store.fr", searchPath: "/portail", language: "french", popularity: 4, apiAvailable: false },
  { name: "Meteojob", baseUrl: "https://meteojob.com", searchPath: "/emploi", language: "french", popularity: 4, apiAvailable: false },
  { name: "Optioncarriere", baseUrl: "https://optioncarriere.com", searchPath: "/emploi", language: "french", popularity: 4, apiAvailable: false },
  { name: "Neuvoo France", baseUrl: "https://neuvoo.fr", searchPath: "/emplois", language: "french", popularity: 4, apiAvailable: false },
  { name: "Jooble France", baseUrl: "https://fr.jooble.org", searchPath: "/emploi", language: "french", popularity: 4, apiAvailable: false },
  
  // Corporate and enterprise
  { name: "Capgemini Careers", baseUrl: "https://capgemini.com", searchPath: "/careers", language: "french", popularity: 3, apiAvailable: false },
  { name: "Accenture France", baseUrl: "https://accenture.com", searchPath: "/fr-fr/careers", language: "french", popularity: 3, apiAvailable: false },
  { name: "Thales Careers", baseUrl: "https://thalesgroup.com", searchPath: "/careers", language: "french", popularity: 3, apiAvailable: false },
  { name: "Orange Jobs", baseUrl: "https://orange-jobs.com", searchPath: "/offres", language: "french", popularity: 3, apiAvailable: false },
  { name: "SNCF Connect Carrières", baseUrl: "https://careers.sncf-connect.com", searchPath: "/jobs", language: "french", popularity: 3, apiAvailable: false },
  
  // Additional platforms
  { name: "Fashion Jobs", baseUrl: "https://fashionjobs.com", searchPath: "/emploi-mode-france", language: "french", popularity: 2, apiAvailable: false },
  { name: "Handicap Job", baseUrl: "https://handicap-job.com", searchPath: "/offres", language: "french", popularity: 2, apiAvailable: false }
];

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  source: string;
  language: 'french' | 'english';
  postedDate: Date;
  requirements: string[];
  benefits?: string[];
}

export class JobDeduplicationService {
  private seenJobs = new Map<string, JobListing>();
  
  generateJobHash(job: JobListing): string {
    // Create unique hash based on company + title + location
    const normalizedTitle = job.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedCompany = job.company.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedLocation = job.location.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    return `${normalizedCompany}-${normalizedTitle}-${normalizedLocation}`;
  }
  
  isDuplicate(job: JobListing): boolean {
    const hash = this.generateJobHash(job);
    return this.seenJobs.has(hash);
  }
  
  addJob(job: JobListing): boolean {
    const hash = this.generateJobHash(job);
    
    if (this.seenJobs.has(hash)) {
      return false; // Duplicate found
    }
    
    this.seenJobs.set(hash, job);
    return true; // New job added
  }
  
  getUniqueJobs(): JobListing[] {
    return Array.from(this.seenJobs.values());
  }
  
  clear(): void {
    this.seenJobs.clear();
  }
  
  getStats(): { total: number, duplicatesFound: number } {
    return {
      total: this.seenJobs.size,
      duplicatesFound: 0 // Would track in real implementation
    };
  }
}

export const jobDeduplicationService = new JobDeduplicationService();