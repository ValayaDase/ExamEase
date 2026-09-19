import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, createSessionToken, TOKEN_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const existingUser = await db.collection('users').findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const result = await db.collection('users').insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'TEACHER',
      createdAt: new Date(),
    });

    const userId = result.insertedId.toString();
    const token = await createSessionToken({ userId, email: email.toLowerCase().trim(), name: name.trim() });

    const response = NextResponse.json(
      {
        message: 'Account registered successfully.',
        user: { id: userId, name: name.trim(), email: email.toLowerCase().trim(), role: 'TEACHER' },
      },
      { status: 201 }
    );

    response.cookies.set({
      name: TOKEN_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
