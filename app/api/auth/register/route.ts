import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, registerUser } from "@/lib/auth";
import { getApiMessages } from "@/lib/api-messages";

const schema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.email(),
  password: z.string().min(8).max(128).regex(/[a-zA-Z]/).regex(/[0-9]/),
});

export async function POST(request: Request) {
  const copy = await getApiMessages();
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: copy.validRegistration }, { status: 400 });
  }
  try {
    const user = registerUser(parsed.data.name, parsed.data.email, parsed.data.password);
    await createSession(user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return NextResponse.json({ error: copy.emailExists }, { status: 409 });
    }
    return NextResponse.json({ error: copy.createAccountFailed }, { status: 500 });
  }
}
