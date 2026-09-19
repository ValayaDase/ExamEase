import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { generateAndValidateMCQs, regenerateSingleQuestion } from '@/services/mcq.service';
import { NLPAnalysisResult, GenerationOptions, Question } from '@/types';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { nlpResult, questionCount, difficulty, mcqTitle } = (await request.json()) as {
      nlpResult: NLPAnalysisResult;
      questionCount: number;
      difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
      mcqTitle: string;
    };

    if (!nlpResult || !nlpResult.concepts || nlpResult.concepts.length === 0) {
      return NextResponse.json({ error: 'Valid NLP processing results are required.' }, { status: 400 });
    }

    const requestedCount = Number(questionCount) || 10;
    if (requestedCount < 1 || requestedCount > 50) {
      return NextResponse.json({ error: 'Question count must be between 1 and 50.' }, { status: 400 });
    }

    const options: GenerationOptions = {
      questionCount: requestedCount,
      difficulty: difficulty || 'medium',
      mcqTitle: mcqTitle || 'Practice MCQ Set',
    };

    // Generate and validate MCQs based strictly on NLP prepared context
    const questions = await generateAndValidateMCQs(nlpResult, options);

    return NextResponse.json({
      message: 'MCQs generated and validated successfully.',
      questionCount: questions.length,
      questions,
    });
  } catch (error: unknown) {
    console.error('MCQ generation error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to generate MCQs.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { nlpResult, currentQuestion, difficulty } = (await request.json()) as {
      nlpResult: NLPAnalysisResult;
      currentQuestion: Question;
      difficulty: string;
    };

    if (!nlpResult || !currentQuestion) {
      return NextResponse.json({ error: 'NLP result and current question are required.' }, { status: 400 });
    }

    const regeneratedQuestion = await regenerateSingleQuestion(nlpResult, currentQuestion, difficulty || 'medium');

    return NextResponse.json({
      message: 'Question regenerated successfully.',
      question: regeneratedQuestion,
    });
  } catch (error: unknown) {
    console.error('Question regeneration error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to regenerate question.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
