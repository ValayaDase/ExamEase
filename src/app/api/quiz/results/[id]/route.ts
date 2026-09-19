import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid attempt ID.' }, { status: 400 });
    }

    const db = await getDb();
    const attempt = await db.collection('quiz_attempts').findOne({ _id: new ObjectId(id) });

    if (!attempt) {
      return NextResponse.json({ error: 'Quiz result attempt not found.' }, { status: 404 });
    }

    return NextResponse.json({
      attempt: {
        id: attempt._id.toString(),
        _id: attempt._id.toString(),
        mcqSetId: attempt.mcqSetId,
        mcqSetTitle: attempt.mcqSetTitle,
        subjectId: attempt.subjectId,
        userId: attempt.userId,
        userName: attempt.userName,
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        percentage: attempt.percentage,
        answers: attempt.answers || [],
        completedAt: attempt.completedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching attempt results:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz attempt results.' }, { status: 500 });
  }
}
