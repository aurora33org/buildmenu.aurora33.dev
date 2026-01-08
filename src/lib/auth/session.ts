import { randomBytes } from 'crypto';
import { getDatabase } from '../db/schema';
import type { User, Session } from '../db/schema';

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
export function createSession(userId: string): { token: string; sessionId: string } {
  const db = getDatabase();
  const sessionId = randomBytes(16).toString('hex');
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE).toISOString();

  db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, userId, token, expiresAt);

  return { token, sessionId };
}

/**
 * Validate a session token and return the user if valid
 */
export function validateSession(token: string): (User & { sessionId: string }) | null {
  const db = getDatabase();

  const result = db.prepare(`
    SELECT
      s.id as session_id,
      u.*
    FROM sessions s
    INNER JOIN users u ON u.id = s.user_id
    WHERE s.token = ?
      AND s.expires_at > datetime('now')
      AND u.deleted_at IS NULL
  `).get(token) as any;

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    email: result.email,
    password_hash: result.password_hash,
    name: result.name,
    role: result.role,
    restaurant_id: result.restaurant_id,
    created_at: result.created_at,
    updated_at: result.updated_at,
    deleted_at: result.deleted_at,
    sessionId: result.session_id,
  };
}

/**
 * Delete a session (logout)
 */
export function deleteSession(token: string): void {
  const db = getDatabase();

  db.prepare(`
    DELETE FROM sessions
    WHERE token = ?
  `).run(token);
}

/**
 * Delete all sessions for a user
 */
export function deleteUserSessions(userId: string): void {
  const db = getDatabase();

  db.prepare(`
    DELETE FROM sessions
    WHERE user_id = ?
  `).run(userId);
}

/**
 * Refresh/extend a session's expiration
 */
export function refreshSession(token: string): boolean {
  const db = getDatabase();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE).toISOString();

  const result = db.prepare(`
    UPDATE sessions
    SET expires_at = ?
    WHERE token = ?
      AND expires_at > datetime('now')
  `).run(expiresAt, token);

  return result.changes > 0;
}

/**
 * Clean up expired sessions (run periodically)
 */
export function cleanupExpiredSessions(): number {
  const db = getDatabase();

  const result = db.prepare(`
    DELETE FROM sessions
    WHERE expires_at <= datetime('now')
  `).run();

  return result.changes;
}

/**
 * Get session from cookie (helper for middleware/server components)
 */
export function getSessionFromCookie(cookieHeader: string | null): (User & { sessionId: string }) | null {
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

  return validateSession(token);
}
