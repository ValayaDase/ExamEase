import { NLPAnalysisResult, GenerationOptions, Question } from '@/types';

export interface AIService {
  generateMCQs(nlpResult: NLPAnalysisResult, options: GenerationOptions): Promise<Partial<Question>[]>;
  regenerateSingleQuestion(nlpResult: NLPAnalysisResult, currentQuestion: Partial<Question>, difficulty: string): Promise<Partial<Question>>;
}
