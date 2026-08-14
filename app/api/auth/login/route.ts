import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticate, createSession } from "@/lib/auth";

const schema = z.object({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "请输入有效的邮箱和密码。" }, { status: 400 });
  const user = authenticate(parsed.data.email, parsed.data.password);
  if (!user) return NextResponse.json({ error: "邮箱或密码不正确。" }, { status: 401 });
  await createSession(user.id);
  return NextResponse.json({ user });
}
