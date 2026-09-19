import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getDb } from './db';
import { User } from '@/types';
import { ObjectId } from 'mongodb';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'examease_super_secret_jwt_key_2026_nlp_project'
);

const TOKEN_NAME = 'examease_token';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: { userId: string; email: string; name: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: string; email: string; name: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;

    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const db = await getDb();
    const userDoc = await db.collection('users').findOne({ _id: new ObjectId(payload.userId) });

    if (!userDoc) return null;

    return {
      _id: userDoc._id.toString(),
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role || 'TEACHER',
      createdAt: userDoc.createdAt,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

export { TOKEN_NAME };
