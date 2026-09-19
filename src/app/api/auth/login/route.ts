import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { comparePassword, createSessionToken, TOKEN_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const userId = user._id.toString();
    const token = await createSessionToken({ userId, email: user.email, name: user.name });

    const response = NextResponse.json({
      message: 'Login successful.',
      user: { id: userId, name: user.name, email: user.email, role: user.role || 'TEACHER' },
    });

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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error during login.' },
      { status: 500 }
    );
  }
}
