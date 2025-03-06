import OpenAI from "openai"; 
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.CHATGPT_API_KEY,
  });

const openAiService = async (message) => {
    try {
      const response = await client.chat.completions.create({
        messages: [
          { role: 'system', content: 'Eres un asistente' },
          { role: 'user', content: message }
        ],
        model: 'gpt-4o-mini'
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error(error);
    }
  };
  
  export default openAiService;
