import { AIService } from './ai.interface';
import { NLPAnalysisResult, GenerationOptions, Question } from '@/types';
import { GoogleGenAI } from '@google/genai';

export class GeminiAIService implements AIService {
  private apiKey: string;
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async generateMCQs(nlpResult: NLPAnalysisResult, options: GenerationOptions): Promise<Partial<Question>[]> {
    const { questionCount, difficulty } = options;

    // Prepare context payload from NLP analysis
    const contextConcepts = nlpResult.concepts.slice(0, 15).map((c, i) => `
Concept ${i + 1}: ${c.concept} (Importance Score: ${c.importanceScore})
Supporting Source Text:
${c.supportingSentences.join('\n')}
`).join('\n---\n');

    const prompt = `You are an academic exam generator.
Your task is to generate EXACTLY ${questionCount} multiple choice questions (MCQs) based ONLY on the provided source content extracted from lecture notes.

CRITICAL CONSTRAINTS:
1. Do NOT use external knowledge. All facts must come strictly from the source content below.
2. Generate EXACTLY ${questionCount} questions.
3. Target Difficulty Level: ${difficulty}.
4. Each question must have EXACTLY 4 options (A, B, C, D).
5. EXACTLY ONE option must be correct.
6. Provide a concise explanation citing the source material.
7. Avoid duplicate questions or duplicate choices.

SOURCE CONTENT:
${contextConcepts}

RETURN FORMAT:
Return ONLY valid JSON matching this exact structure, with no markdown codeblocks:
{
  "questions": [
    {
      "question": "Clear academic question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact string matching one of the options",
      "explanation": "Short explanation based on provided source notes.",
      "difficulty": "${difficulty}",
      "type": "concept",
      "sourceConcept": "Name of concept from source"
    }
  ]
}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        }
      });

      const text = response.text || '';
      const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Gemini API returned invalid format: missing questions array');
      }

      return parsed.questions;
    } catch (error) {
      console.error('Gemini AI Generation Error:', error);
      throw error;
    }
  }

  async regenerateSingleQuestion(nlpResult: NLPAnalysisResult, currentQuestion: Partial<Question>, difficulty: string): Promise<Partial<Question>> {
    const concept = currentQuestion.sourceConcept || nlpResult.concepts[0]?.concept || 'General Concept';
    const relatedConcept = nlpResult.concepts.find((c) => c.concept.toLowerCase() === concept.toLowerCase()) || nlpResult.concepts[0];

    const contextText = relatedConcept ? relatedConcept.supportingSentences.join('\n') : nlpResult.cleanedText.slice(0, 1000);

    const prompt = `Generate a single new MCQ question based ONLY on this source text.
Concept: ${concept}
Difficulty: ${difficulty}
Source Text:
${contextText}

JSON Output structure:
{
  "question": "Question text...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "Matching option string",
  "explanation": "Explanation...",
  "difficulty": "${difficulty}",
  "type": "concept",
  "sourceConcept": "${concept}"
}`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.4 }
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  }
}
