export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: 'TEACHER' | 'STUDENT';
  createdAt: Date | string;
}

export interface Subject {
  _id?: string;
  id?: string;
  name: string;
  semester?: string;
  department?: string;
  userId: string;
  userName: string;
  mcqSetCount?: number;
  createdAt: Date | string;
}

export interface Question {
  id: string;
  question: string;
  options: string[]; // exactly 4 options
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  type: 'definition' | 'concept' | 'relationship' | 'comparison' | 'process' | 'application' | 'example';
  sourceConcept: string;
}

export interface MCQSet {
  _id?: string;
  id?: string;
  title: string;
  subjectId: string;
  subjectName?: string;
  userId: string;
  userName: string;
  documentId?: string;
  fileName?: string;
  questionCount: number;
  difficulty: string;
  questions: Question[];
  createdAt: Date | string;
}

export interface QuizAnswer {
  questionId: string;
  questionText: string;
  selectedOption: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizAttempt {
  _id?: string;
  id?: string;
  mcqSetId: string;
  mcqSetTitle: string;
  subjectId?: string;
  userId: string;
  userName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: QuizAnswer[];
  completedAt: Date | string;
}

export interface NLPConcept {
  concept: string;
  importanceScore: number;
  supportingSentences: string[];
  sourceSection?: string;
  frequency: number;
  posTag?: string;
}

export interface NLPAnalysisResult {
  rawText: string;
  cleanedText: string;
  sentenceCount: number;
  tokenCount: number;
  uniqueTokenCount: number;
  sentences: string[];
  ngrams: {
    unigrams: { word: string; count: number }[];
    bigrams: { phrase: string; count: number }[];
    trigrams: { phrase: string; count: number }[];
  };
  concepts: NLPConcept[];
  definitionSentences: string[];
}

export interface GenerationOptions {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  mcqTitle: string;
}
