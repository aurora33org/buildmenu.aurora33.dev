import { randomBytes } from 'crypto';
import prisma from '../db/prisma';
import type { User } from '../db/types';

const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE || '604800000'); // 7 days

/**
 * Generate a secure random session token
 */
function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<{ token: string; sessionId: string }> {
  const sessionId = randomBytes(16).toString('hex');
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      token,
      expiresAt,
    },
  });

  return { token, sessionId };
}

/**
 * Validate a session token and return the user if valid
 */
export async function validateSession(token: string): Promise<(User & { sessionId: string }) | null> {
  const session = await prisma.session.findUnique({
    where: {
      token,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: true,
    },
  });

  if (!session || !session.user || session.user.deletedAt !== null) {
    return null;
  }

  return {
    ...session.user,
    sessionId: session.id,
  };
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { token },
  });
}

/**
 * Delete all sessions for a user
 */
export async function deleteUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

/**
 * Refresh/extend a session's expiration
 */
export async function refreshSession(token: string): Promise<boolean> {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);

  const result = await prisma.session.updateMany({
    where: {
      token,
      expiresAt: { gt: new Date() },
    },
    data: {
      expiresAt,
    },
  });

  return result.count > 0;
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: { lte: new Date() },
    },
  });

  return result.count;
}

/**
 * Get session from cookie (helper for middleware/server components)
 */
export async function getSessionFromCookie(cookieHeader: string | null): Promise<(User & { sessionId: string }) | null> {
  if (!cookieHeader) {
    return null;
  }

  // Parse cookie header to get session token
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith('session='));

  if (!sessionCookie) {
    return null;
  }

  const token = sessionCookie.split('=')[1];
  if (!token) {
    return null;
  }

  return await validateSession(token);
}
