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
      return NextResponse.json({ error: 'Invalid MCQ Set ID.' }, { status: 400 });
    }

    const db = await getDb();
    const setDoc = await db.collection('mcq_sets').findOne({ _id: new ObjectId(id) });

    if (!setDoc) {
      return NextResponse.json({ error: 'MCQ Set not found.' }, { status: 404 });
    }

    // Also fetch subject details if present
    let subjectName = 'General Subject';
    if (setDoc.subjectId && ObjectId.isValid(setDoc.subjectId)) {
      const subj = await db.collection('subjects').findOne({ _id: new ObjectId(setDoc.subjectId) });
      if (subj) subjectName = subj.name;
    }

    return NextResponse.json({
      mcqSet: {
        id: setDoc._id.toString(),
        _id: setDoc._id.toString(),
        title: setDoc.title,
        subjectId: setDoc.subjectId,
        subjectName,
        userId: setDoc.userId,
        userName: setDoc.userName,
        questionCount: setDoc.questionCount,
        difficulty: setDoc.difficulty,
        questions: setDoc.questions || [],
        createdAt: setDoc.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching MCQ set:', error);
    return NextResponse.json({ error: 'Failed to fetch MCQ set.' }, { status: 500 });
  }
}
