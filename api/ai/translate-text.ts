import { VercelRequest, VercelResponse } from '@vercel/node';
import { aiService } from "../../server/services/aiService";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, fromLanguage, toLanguage } = req.body;

    if (!text || !fromLanguage || !toLanguage) {
      return res.status(400).json({ error: "Text, fromLanguage, and toLanguage are required" });
    }

    // Validate supported languages
    const supportedLanguages = ['english', 'french'];
    if (!supportedLanguages.includes(fromLanguage) || !supportedLanguages.includes(toLanguage)) {
      return res.status(400).json({ 
        error: "Only English and French are supported",
        supportedLanguages
      });
    }

    // Detect language first
    const detectedLanguage = await aiService.detectLanguage(text);
    
    // Translate text
    const translatedText = await aiService.translateText(text, fromLanguage, toLanguage);

    res.status(200).json({
      success: true,
      originalText: text.length > 100 ? text.substring(0, 100) + '...' : text,
      translatedText,
      fromLanguage,
      toLanguage,
      detectedLanguage,
      translatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Failed to translate text" });
  }
}