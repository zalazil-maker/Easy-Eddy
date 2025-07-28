import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, text, language, jobDescription } = req.body;

    switch (action) {
      case 'translate':
        if (!text || !language) {
          return res.status(400).json({ error: "Text and target language required" });
        }

        const translationResponse = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: `You are a professional translator. Translate the following text to ${language}. Maintain the professional tone and format.`
            },
            {
              role: "user",
              content: text
            }
          ],
          max_tokens: 1000,
        });

        return res.status(200).json({
          success: true,
          translatedText: translationResponse.choices[0].message.content
        });

      case 'generate-cover-letter':
        if (!jobDescription) {
          return res.status(400).json({ error: "Job description required" });
        }

        const coverLetterResponse = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are a professional career coach. Write a compelling cover letter based on the job description provided. Make it professional, engaging, and tailored to the specific role."
            },
            {
              role: "user",
              content: `Job Description: ${jobDescription}`
            }
          ],
          max_tokens: 500,
        });

        return res.status(200).json({
          success: true,
          coverLetter: coverLetterResponse.choices[0].message.content
        });

      case 'optimize-cv':
        if (!text) {
          return res.status(400).json({ error: "CV text required" });
        }

        const optimizationResponse = await openai.chat.completions.create({
          model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
          messages: [
            {
              role: "system",
              content: "You are a professional CV consultant. Analyze the CV and provide specific optimization suggestions to improve it for job applications. Focus on structure, keywords, and presentation."
            },
            {
              role: "user",
              content: text
            }
          ],
          max_tokens: 800,
          response_format: { type: "json_object" }
        });

        const suggestions = JSON.parse(optimizationResponse.choices[0].message.content || '{}');
        return res.status(200).json({
          success: true,
          suggestions
        });

      default:
        return res.status(400).json({ error: "Invalid action" });
    }

  } catch (error) {
    console.error("AI service error:", error);
    res.status(500).json({ error: "AI service error" });
  }
}