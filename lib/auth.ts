import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
import type { AuthUser } from "@/lib/models";

const COOKIE_NAME = "tutorly_session";
const SESSION_DAYS = 14;

function useSecureCookie(): boolean {
  if (process.env.SESSION_COOKIE_SECURE === "true") return true;
  if (process.env.SESSION_COOKIE_SECURE === "false") return false;
  return process.env.NODE_ENV === "production";
}

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  created_at: string;
  password_hash?: string;
};

function toUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  getDb()
    .prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)")
    .run(randomUUID(), userId, tokenHash(token), expiresAt.toISOString(), new Date().toISOString());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: useSecureCookie(),
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash(token));
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.role, u.created_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    )
    .get(tokenHash(token), new Date().toISOString()) as UserRow | undefined;

  if (!row) return null;
  db.prepare("UPDATE users SET last_seen_at = ? WHERE id = ?").run(new Date().toISOString(), row.id);
  return toUser(row);
}

export function authenticate(email: string, password: string): AuthUser | null {
  const row = getDb()
    .prepare("SELECT id, name, email, role, created_at, password_hash FROM users WHERE lower(email) = lower(?)")
    .get(email.trim()) as UserRow | undefined;

  if (!row?.password_hash || !bcrypt.compareSync(password, row.password_hash)) return null;
  return toUser(row);
}

export function registerUser(name: string, email: string, password: string): AuthUser {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(normalizedEmail);
  if (existing) throw new Error("EMAIL_EXISTS");

  const row: UserRow = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    role: "student",
    created_at: new Date().toISOString(),
  };
  db.prepare(
    "INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, 'student', ?)",
  ).run(row.id, row.name, row.email, bcrypt.hashSync(password, 10), row.created_at);

  const courses = db.prepare("SELECT id FROM courses WHERE is_archived = 0").all() as { id: string }[];
  const enroll = db.prepare("INSERT OR IGNORE INTO enrollments (user_id, course_id, progress, created_at) VALUES (?, ?, 0, ?)");
  for (const course of courses) enroll.run(row.id, course.id, row.created_at);
  return toUser(row);
}

export function privacySafeUserIdentifier(userId: string): string {
  const secret = process.env.SESSION_SECRET || "tutorly-local-development";
  return createHash("sha256").update(`${secret}:${userId}`).digest("hex");
}
