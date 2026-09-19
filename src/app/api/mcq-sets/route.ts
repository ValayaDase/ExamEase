import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { subjectId, title, fileName, difficulty, questions } = await request.json();

    if (!subjectId || !title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Subject ID, title, and at least one question are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('mcq_sets').insertOne({
      title: title.trim(),
      subjectId: subjectId.toString(),
      userId: user.id,
      userName: user.name,
      fileName: fileName || 'Study Notes.pdf',
      questionCount: questions.length,
      difficulty: difficulty || 'medium',
      questions,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: 'MCQ Set saved successfully.',
        mcqSetId: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving MCQ set:', error);
    return NextResponse.json({ error: 'Failed to save MCQ set.' }, { status: 500 });
  }
}
