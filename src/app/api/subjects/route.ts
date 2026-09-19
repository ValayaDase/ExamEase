import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const db = await getDb();
    const subjects = await db
      .collection('subjects')
      .find({ userId: user.id })
      .sort({ createdAt: -1 })
      .toArray();

    // Map _id to string and calculate count of MCQ sets per subject
    const formattedSubjects = await Promise.all(
      subjects.map(async (subj) => {
        const mcqCount = await db.collection('mcq_sets').countDocuments({ subjectId: subj._id.toString() });
        return {
          id: subj._id.toString(),
          _id: subj._id.toString(),
          name: subj.name,
          semester: subj.semester || '',
          department: subj.department || '',
          userId: subj.userId,
          userName: subj.userName,
          mcqSetCount: mcqCount,
          createdAt: subj.createdAt,
        };
      })
    );

    return NextResponse.json({ subjects: formattedSubjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({ error: 'Failed to fetch subjects.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { name, semester, department } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Subject name is required.' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('subjects').insertOne({
      name: name.trim(),
      semester: semester?.trim() || '',
      department: department?.trim() || '',
      userId: user.id,
      userName: user.name,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: 'Subject created successfully.',
        subject: {
          id: result.insertedId.toString(),
          _id: result.insertedId.toString(),
          name: name.trim(),
          semester: semester?.trim() || '',
          department: department?.trim() || '',
          userId: user.id,
          userName: user.name,
          mcqSetCount: 0,
          createdAt: new Date(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json({ error: 'Failed to create subject.' }, { status: 500 });
  }
}
