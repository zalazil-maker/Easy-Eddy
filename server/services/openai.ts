import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// CV optimization removed - CVs are sent as-is without modification

// Job summary generation removed - applications will be sent as-is in email

export async function detectJobLanguage(jobTitle: string, company: string, description: string): Promise<string> {
  try {
    const prompt = `
    Analyze the following job posting and determine if it's in French or English.
    
    Job Title: ${jobTitle}
    Company: ${company}
    Description: ${description}
    
    Return only "fr" for French or "en" for English.
    
    Respond with only the language code in JSON format: {"language": "code"}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a language detection expert. Analyze job postings and determine if they are in French or English only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const language = result.language || "en";
    
    // Only allow French or English
    return language === "fr" ? "fr" : "en";
  } catch (error) {
    console.error("Language detection error:", error);
    return "en"; // Default to English if detection fails
  }
}
