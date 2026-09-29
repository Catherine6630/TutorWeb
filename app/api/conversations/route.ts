import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRecentConversations } from "@/lib/queries";
import { getApiMessages } from "@/lib/api-messages";

export async function GET() {
  const copy = await getApiMessages();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: copy.loginRequired }, { status: 401 });
  return NextResponse.json({ conversations: getRecentConversations(user.id, 50) });
}
