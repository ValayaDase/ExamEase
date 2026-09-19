import { NextResponse } from 'next/server';
import { TOKEN_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully.' });
  response.cookies.set({
    name: TOKEN_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}
