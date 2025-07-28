import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from "../server/storage";
import formidable from 'formidable';
import fs from 'fs';

// Disable default body parser for file upload
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      keepExtensions: true,
      filter: (part) => {
        return !!(part.mimetype && part.mimetype.includes('pdf'));
      }
    });

    const [fields, files] = await form.parse(req);
    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    const language = Array.isArray(fields.language) ? fields.language[0] : fields.language || 'english';

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    if (!files.cv) {
      return res.status(400).json({ error: "CV file required" });
    }

    const cvFile = Array.isArray(files.cv) ? files.cv[0] : files.cv;
    
    // Read file content (for PDF parsing, we'd need pdf-parse here)
    const fileContent = fs.readFileSync(cvFile.filepath);
    
    // For now, store basic file info - in production you'd parse PDF content
    const cvContent = `CV uploaded: ${cvFile.originalFilename} (${fileContent.length} bytes)`;

    // Save CV to database
    await storage.saveUserCV({
      userId: parseInt(userId),
      language,
      content: cvContent,
      filename: cvFile.originalFilename || 'cv.pdf'
    });

    // Clean up temp file
    fs.unlinkSync(cvFile.filepath);

    res.status(200).json({
      success: true,
      message: "CV uploaded successfully",
      filename: cvFile.originalFilename,
      size: fileContent.length
    });

  } catch (error) {
    console.error("CV upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}