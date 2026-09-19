import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { QuizAnswer, Question } from '@/types';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { mcqSetId, userAnswers } = (await request.json()) as {
      mcqSetId: string;
      userAnswers: Record<string, string>; // questionId -> selectedOption
    };

    if (!mcqSetId || !userAnswers || !ObjectId.isValid(mcqSetId)) {
      return NextResponse.json({ error: 'Invalid submission payload.' }, { status: 400 });
    }

    const db = await getDb();
    const mcqSet = await db.collection('mcq_sets').findOne({ _id: new ObjectId(mcqSetId) });

    if (!mcqSet) {
      return NextResponse.json({ error: 'MCQ set not found.' }, { status: 404 });
    }

    const questions: Question[] = mcqSet.questions || [];
    let correctCount = 0;
    const answerBreakdown: QuizAnswer[] = [];

    questions.forEach((q) => {
      const selected = userAnswers[q.id] || '';
      const isCorrect = selected.trim() === q.correctAnswer.trim();
      if (isCorrect) correctCount++;

      answerBreakdown.push({
        questionId: q.id,
        questionText: q.question,
        selectedOption: selected,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || '',
      });
    });

    const totalQuestions = questions.length;
    const percentage = Math.round((correctCount / (totalQuestions || 1)) * 100);

    const attemptDoc = {
      mcqSetId,
      mcqSetTitle: mcqSet.title,
      subjectId: mcqSet.subjectId,
      userId: user.id,
      userName: user.name,
      score: correctCount,
      totalQuestions,
      percentage,
      answers: answerBreakdown,
      completedAt: new Date(),
    };

    const result = await db.collection('quiz_attempts').insertOne(attemptDoc);

    return NextResponse.json({
      message: 'Quiz submitted successfully.',
      attemptId: result.insertedId.toString(),
      score: correctCount,
      totalQuestions,
      percentage,
    });
  } catch (error) {
    console.error('Quiz submission error:', error);
    return NextResponse.json({ error: 'Failed to submit quiz.' }, { status: 500 });
  }
}
