import { AIService } from './ai.interface';
import { GeminiAIService } from './gemini.service';
import { MockAIService } from './mock.service';

export function getAIService(): AIService {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 5) {
    return new GeminiAIService(apiKey.trim());
  }

  return new MockAIService();
}
