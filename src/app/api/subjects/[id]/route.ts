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
      return NextResponse.json({ error: 'Invalid subject ID.' }, { status: 400 });
    }

    const db = await getDb();
    const subjectDoc = await db.collection('subjects').findOne({ _id: new ObjectId(id) });

    if (!subjectDoc) {
      return NextResponse.json({ error: 'Subject not found.' }, { status: 404 });
    }

    // Fetch all MCQ sets created for this subject
    const mcqSets = await db
      .collection('mcq_sets')
      .find({ subjectId: id })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedMcqSets = mcqSets.map((set) => ({
      id: set._id.toString(),
      _id: set._id.toString(),
      title: set.title,
      subjectId: set.subjectId,
      userId: set.userId,
      userName: set.userName,
      questionCount: set.questionCount,
      difficulty: set.difficulty,
      questions: set.questions || [],
      createdAt: set.createdAt,
    }));

    return NextResponse.json({
      subject: {
        id: subjectDoc._id.toString(),
        _id: subjectDoc._id.toString(),
        name: subjectDoc.name,
        semester: subjectDoc.semester || '',
        department: subjectDoc.department || '',
        userId: subjectDoc.userId,
        userName: subjectDoc.userName,
        mcqSetCount: formattedMcqSets.length,
        createdAt: subjectDoc.createdAt,
      },
      mcqSets: formattedMcqSets,
    });
  } catch (error) {
    console.error('Error fetching subject details:', error);
    return NextResponse.json({ error: 'Failed to fetch subject details.' }, { status: 500 });
  }
}
