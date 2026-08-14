import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRecentConversations } from "@/lib/queries";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录。" }, { status: 401 });
  return NextResponse.json({ conversations: getRecentConversations(user.id, 50) });
}
