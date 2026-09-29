import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getApiMessages } from "@/lib/api-messages";

const schema = z.object({
  code: z.string().trim().min(2).max(20).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(600),
  term: z.string().trim().max(80).optional(),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#625bf6"),
});

export async function POST(request: Request) {
  const copy = await getApiMessages();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: copy.loginRequired }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: copy.adminRequired }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: copy.incompleteCourse }, { status: 400 });
  const db = getDb();
  const now = new Date().toISOString();
  const id = randomUUID();
  try {
    const transaction = db.transaction(() => {
      db.prepare("INSERT INTO courses (id, code, name, description, term, accent, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'book-open', ?, ?)").run(id, parsed.data.code, parsed.data.name, parsed.data.description, parsed.data.term || null, parsed.data.accent, now, now);
      const students = db.prepare("SELECT id FROM users").all() as { id: string }[];
      const enroll = db.prepare("INSERT INTO enrollments (user_id, course_id, progress, created_at) VALUES (?, ?, 0, ?)");
      for (const student of students) enroll.run(student.id, id, now);
    });
    transaction();
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: copy.courseExists }, { status: 409 });
  }
}
