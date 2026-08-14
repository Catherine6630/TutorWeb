import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAiConfigured } from "@/lib/openai";

export async function GET() {
  const db = getDb();
  const result = db.prepare("SELECT 1 AS ok").get() as { ok: number };
  return NextResponse.json({ status: result.ok === 1 ? "ok" : "degraded", database: "connected", ai: isAiConfigured() ? "configured" : "not_configured" });
}
