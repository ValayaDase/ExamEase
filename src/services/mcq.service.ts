import { Question, NLPAnalysisResult, GenerationOptions } from '@/types';
import { getAIService } from './ai/ai.factory';
import { removeDuplicateQuestions } from './nlp/duplicateDetector';

export async function generateAndValidateMCQs(
  nlpResult: NLPAnalysisResult,
  options: GenerationOptions
): Promise<Question[]> {
  const aiService = getAIService();
  const rawQuestions = await aiService.generateMCQs(nlpResult, options);

  // 1. Remove duplicate/near-duplicate questions using NLP lexical similarity
  const dedupedQuestions = removeDuplicateQuestions(rawQuestions);

  // 2. Validate and clean each question item
  const validQuestions: Question[] = [];

  for (let idx = 0; idx < dedupedQuestions.length; idx++) {
    const raw = dedupedQuestions[idx];

    // Ensure non-empty question text
    if (!raw.question || raw.question.trim().length < 5) continue;

    // Ensure options array has exactly 4 non-empty options
    let opts = (raw.options || []).map((o) => o.trim()).filter((o) => o.length > 0);
    if (opts.length < 4) {
      // Pad missing options if needed
      while (opts.length < 4) {
        opts.push(`Alternative ${opts.length + 1}`);
      }
    } else if (opts.length > 4) {
      opts = opts.slice(0, 4);
    }

    // Ensure correct answer is non-empty and present in options
    let correct = (raw.correctAnswer || '').trim();
    if (!opts.includes(correct)) {
      correct = opts[0]; // fallback to first option if exact match missed
    }

    validQuestions.push({
      id: raw.id || `q-${idx + 1}-${Date.now()}`,
      question: raw.question.trim(),
      options: opts,
      correctAnswer: correct,
      explanation: raw.explanation?.trim() || `Supported by concept: ${raw.sourceConcept || 'Note context'}`,
      difficulty: (raw.difficulty || options.difficulty) as 'easy' | 'medium' | 'hard' | 'mixed',
      type: (raw.type || 'concept') as 'definition' | 'concept' | 'relationship' | 'comparison' | 'process' | 'application' | 'example',
      sourceConcept: raw.sourceConcept?.trim() || 'General Concept',
    });
  }

  // Ensure exact count match
  if (validQuestions.length < options.questionCount) {
    // Top up missing questions using fallback if needed
    const aiFallback = getAIService();
    const topUpOptions = { ...options, questionCount: options.questionCount - validQuestions.length };
    const extraQuestions = await aiFallback.generateMCQs(nlpResult, topUpOptions);

    extraQuestions.forEach((eq, i) => {
      validQuestions.push({
        id: `q-extra-${i + 1}-${Date.now()}`,
        question: eq.question || `What is the significance of ${nlpResult.concepts[i % nlpResult.concepts.length]?.concept || 'the main topic'}?`,
        options: eq.options && eq.options.length === 4 ? eq.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: eq.correctAnswer || (eq.options ? eq.options[0] : 'Option A'),
        explanation: eq.explanation || 'Extracted from uploaded notes.',
        difficulty: (eq.difficulty || options.difficulty) as 'easy' | 'medium' | 'hard',
        type: 'concept',
        sourceConcept: eq.sourceConcept || 'Study Notes',
      });
    });
  }

  return validQuestions.slice(0, options.questionCount);
}

export async function regenerateSingleQuestion(
  nlpResult: NLPAnalysisResult,
  currentQuestion: Question,
  difficulty: string
): Promise<Question> {
  const aiService = getAIService();
  const raw = await aiService.regenerateSingleQuestion(nlpResult, currentQuestion, difficulty);

  const opts = (raw.options || []).map((o) => o.trim()).filter((o) => o.length > 0);
  while (opts.length < 4) opts.push(`Option ${opts.length + 1}`);

  let correct = (raw.correctAnswer || '').trim();
  if (!opts.includes(correct)) correct = opts[0];

  return {
    id: `regen-${Date.now()}`,
    question: raw.question?.trim() || 'Regenerated Question',
    options: opts.slice(0, 4),
    correctAnswer: correct,
    explanation: raw.explanation?.trim() || 'Regenerated question explanation.',
    difficulty: (raw.difficulty || difficulty) as 'easy' | 'medium' | 'hard',
    type: (raw.type || 'concept') as 'definition' | 'concept',
    sourceConcept: raw.sourceConcept || currentQuestion.sourceConcept,
  };
}
