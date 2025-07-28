import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../server/storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const { action } = req.query;

  try {
    switch (action) {
      case 'search-french':
        if (method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }

        const { query, location } = req.body;
        
        // Mock French job search results for demonstration
        const mockJobs = [
          {
            id: 1,
            title: `Développeur ${query || 'Full Stack'}`,
            company: "Tech Paris",
            location: location || "Paris, France",
            description: `Recherche ${query || 'développeur'} expérimenté pour rejoindre notre équipe dynamique.`,
            salary: "45000-60000",
            url: "https://example.fr/job1",
            source: "pole-emploi"
          },
          {
            id: 2,
            title: `${query || 'Développeur'} Senior`,
            company: "Innovation Lyon",
            location: location || "Lyon, France", 
            description: `Opportunité pour ${query || 'développeur'} senior dans une startup en croissance.`,
            salary: "50000-70000",
            url: "https://example.fr/job2",
            source: "indeed-france"
          }
        ];

        return res.status(200).json({
          success: true,
          jobs: mockJobs,
          totalFound: mockJobs.length
        });

      case 'applications':
        if (method === 'GET') {
          const { userId } = req.query;
          if (!userId) {
            return res.status(400).json({ error: "User ID required" });
          }

          const applications = await storage.getJobApplications(parseInt(userId as string));
          return res.status(200).json({
            success: true,
            applications
          });
        }
        
        if (method === 'POST') {
          const { userId, jobTitle, company, location, source } = req.body;
          
          if (!userId || !jobTitle || !company) {
            return res.status(400).json({ error: "Missing required fields" });
          }

          const application = await storage.createJobApplication({
            userId,
            jobTitle,
            company,
            location: location || 'Unknown',
            source: source || 'manual',
            status: 'applied'
          });

          return res.status(201).json({
            success: true,
            application
          });
        }
        break;

      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error) {
    console.error("Jobs API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}