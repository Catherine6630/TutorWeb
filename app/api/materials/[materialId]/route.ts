import { NextResponse } from "next/server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getApiMessages } from "@/lib/api-messages";

export async function DELETE(_request: Request, { params }: { params: Promise<{ materialId: string }> }) {
  const copy = await getApiMessages();
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: copy.loginRequired }, { status: 401 });
  const { materialId } = await params;
  const db = getDb();
  const material = db.prepare("SELECT id, owner_id, file_path FROM materials WHERE id = ?").get(materialId) as { id: string; owner_id: string | null; file_path: string | null } | undefined;
  if (!material) return NextResponse.json({ error: copy.materialMissing }, { status: 404 });
  if (user.role !== "admin" && material.owner_id !== user.id) return NextResponse.json({ error: copy.deleteForbidden }, { status: 403 });

  db.prepare("DELETE FROM materials WHERE id = ?").run(materialId);
  if (material.file_path) {
    const uploadRoot = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOAD_DIR || "./storage/materials");
    const resolved = path.resolve(material.file_path);
    if (resolved.startsWith(`${uploadRoot}${path.sep}`)) await unlink(resolved).catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}
