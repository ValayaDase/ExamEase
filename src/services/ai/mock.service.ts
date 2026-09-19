import { AIService } from './ai.interface';
import { NLPAnalysisResult, GenerationOptions, Question } from '@/types';
import { lemmatizeWord } from '../nlp/stemmerLemmatizer';

export class MockAIService implements AIService {
  async generateMCQs(nlpResult: NLPAnalysisResult, options: GenerationOptions): Promise<Partial<Question>[]> {
    const { questionCount, difficulty } = options;
    const questions: Partial<Question>[] = [];
    const concepts = nlpResult.concepts;

    if (concepts.length === 0) {
      throw new Error('No extracted concepts available to generate questions.');
    }

    const availableConcepts = [...concepts];

    for (let i = 0; i < questionCount; i++) {
      const conceptObj = availableConcepts[i % availableConcepts.length];
      const conceptName = conceptObj.concept;
      const supportingText = conceptObj.supportingSentences[0] || `${conceptName} is an essential concept in this subject.`;

      // Determine question style based on index & sentence pattern
      let questionText = '';
      let correctAnswer = '';
      let distractors: string[] = [];

      if (supportingText.toLowerCase().includes('is ') || supportingText.toLowerCase().includes('refers to')) {
        questionText = `According to the uploaded notes, how is "${conceptName}" defined?`;
        correctAnswer = supportingText;
        distractors = [
          `A technique used exclusively for secondary data storage.`,
          `An outdated method superseded by manual processing.`,
          `A random statistical noise variable in model training.`,
        ];
      } else {
        questionText = `Which concept is described by the following text: "${supportingText.slice(0, 120)}..."?`;
        correctAnswer = conceptName;

        // Distractor concepts from other concepts in document
        const otherConcepts = concepts.filter((c) => c.concept !== conceptName).map((c) => c.concept);
        distractors = [
          otherConcepts[0] || 'Linear Transformation',
          otherConcepts[1] || 'Lexical Normalization',
          otherConcepts[2] || 'Cross Validation',
        ];
      }

      // Shuffle options cleanly
      const allOptions = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

      questions.push({
        id: `mock-${i + 1}-${Date.now()}`,
        question: questionText,
        options: allOptions,
        correctAnswer,
        explanation: `Based directly on the note: "${supportingText}"`,
        difficulty: (difficulty === 'mixed' ? (i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard') : difficulty) as 'easy' | 'medium' | 'hard',
        type: i % 2 === 0 ? 'definition' : 'concept',
        sourceConcept: conceptName,
      });
    }

    return questions;
  }

  async regenerateSingleQuestion(nlpResult: NLPAnalysisResult, currentQuestion: Partial<Question>, difficulty: string): Promise<Partial<Question>> {
    const concept = currentQuestion.sourceConcept || nlpResult.concepts[0]?.concept || 'Subject Concept';
    const conceptObj = nlpResult.concepts.find((c) => c.concept.toLowerCase() === concept.toLowerCase()) || nlpResult.concepts[0];
    const sentence = conceptObj?.supportingSentences[0] || `${concept} is a key topic.`;

    const questionText = `What is the primary role of ${concept} in the study material?`;
    const correctAnswer = sentence;
    const options = [
      correctAnswer,
      `To serve as a temporary data placeholder.`,
      `To compress network latency during data transfer.`,
      `To prevent model evaluation metric overfitting.`,
    ].sort(() => 0.5 - Math.random());

    return {
      id: `regen-${Date.now()}`,
      question: questionText,
      options,
      correctAnswer,
      explanation: `Regenerated based on source note: "${sentence}"`,
      difficulty: difficulty as 'easy' | 'medium' | 'hard',
      type: 'concept',
      sourceConcept: concept,
    };
  }
}
