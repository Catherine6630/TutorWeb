import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getApiMessages } from "@/lib/api-messages";

const schema = z.object({ messageId: z.string().min(1) });

export async function POST(request: Request) {
  const copy = await getApiMessages();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: copy.loginRequired }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: copy.invalidParameters }, { status: 400 });
  const db = getDb();
  const allowed = db
    .prepare(
      `SELECT m.id FROM messages m JOIN conversations c ON c.id = m.conversation_id
       WHERE m.id = ? AND c.user_id = ? AND m.role = 'assistant'`,
    )
    .get(parsed.data.messageId, user.id);
  if (!allowed) return NextResponse.json({ error: copy.messageMissing }, { status: 404 });
  const existing = db.prepare("SELECT 1 FROM bookmarks WHERE user_id = ? AND message_id = ?").get(user.id, parsed.data.messageId);
  if (existing) {
    db.prepare("DELETE FROM bookmarks WHERE user_id = ? AND message_id = ?").run(user.id, parsed.data.messageId);
    return NextResponse.json({ bookmarked: false });
  }
  db.prepare("INSERT INTO bookmarks (user_id, message_id, created_at) VALUES (?, ?, ?)").run(user.id, parsed.data.messageId, new Date().toISOString());
  return NextResponse.json({ bookmarked: true });
}
