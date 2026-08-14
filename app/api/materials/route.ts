import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { allowedExtensions, ingestMaterial } from "@/lib/ingest";
import { getCourseForUser } from "@/lib/queries";
import { safeFilename } from "@/lib/utils";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "请先登录。" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const courseId = String(form.get("courseId") || "");
  const title = String(form.get("title") || "").trim();
  const materialType = String(form.get("materialType") || "reading");
  const year = String(form.get("year") || "").trim().slice(0, 20);
  const tags = String(form.get("tags") || "").split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 10);

  if (!(file instanceof File) || !courseId || !title) {
    return NextResponse.json({ error: "请选择文件并填写标题与课程。" }, { status: 400 });
  }
  if (!getCourseForUser(user, courseId)) return NextResponse.json({ error: "你没有访问这门课程的权限。" }, { status: 403 });

  const extension = path.extname(file.name).toLowerCase();
  if (!allowedExtensions.has(extension)) return NextResponse.json({ error: "暂不支持这种文件格式。" }, { status: 415 });
  const maxBytes = Number(process.env.MAX_UPLOAD_MB || 15) * 1024 * 1024;
  if (file.size <= 0 || file.size > maxBytes) return NextResponse.json({ error: `文件必须小于 ${process.env.MAX_UPLOAD_MB || 15} MB。` }, { status: 413 });

  const uploadRoot = path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOAD_DIR || "./storage/materials");
  await mkdir(uploadRoot, { recursive: true });
  const storedName = `${randomUUID()}-${safeFilename(file.name)}`;
  const filePath = path.join(uploadRoot, storedName);
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  const materialId = randomUUID();
  const now = new Date().toISOString();
  const visibility = user.role === "admin" && form.get("visibility") === "course" ? "course" : "private";
  getDb().prepare(
    `INSERT INTO materials
      (id, course_id, owner_id, title, filename, material_type, year, tags, visibility, file_path, mime_type, byte_size, processing_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'queued', ?, ?)`,
  ).run(materialId, courseId, user.id, title.slice(0, 160), file.name, materialType, year || null, JSON.stringify(tags), visibility, filePath, file.type || null, file.size, now, now);

  try {
    await ingestMaterial(materialId);
    return NextResponse.json({ id: materialId, status: "ready" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ id: materialId, status: "failed", error: error instanceof Error ? error.message : "资料解析失败。" }, { status: 422 });
  }
}
