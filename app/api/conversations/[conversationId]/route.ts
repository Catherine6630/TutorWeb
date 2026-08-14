import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getConversation } from "@/lib/queries";

export async function GET(_request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  const { conversationId } = await params;
  const conversation = getConversation(user.id, conversationId);
  if (!conversation) return NextResponse.json({ error: "对话不存在。" }, { status: 404 });
  return NextResponse.json({ conversation });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  const { conversationId } = await params;
  const result = getDb().prepare("DELETE FROM conversations WHERE id = ? AND user_id = ?").run(conversationId, user.id);
  if (!result.changes) return NextResponse.json({ error: "对话不存在。" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
