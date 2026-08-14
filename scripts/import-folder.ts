import { copyFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getDb } from "../lib/db";
import { allowedExtensions, ingestMaterial } from "../lib/ingest";
import { safeFilename } from "../lib/utils";

const [courseCodeInput, folderInput] = process.argv.slice(2);
if (!courseCodeInput || !folderInput) {
  console.error("Usage: pnpm import:folder -- <COURSE_CODE> <FOLDER_PATH>");
  process.exit(1);
}

const db = getDb();
const course = db.prepare("SELECT id, code FROM courses WHERE upper(code) = upper(?)").get(courseCodeInput) as { id: string; code: string } | undefined;
if (!course) {
  console.error(`Course ${courseCodeInput} does not exist. Create it in the admin dashboard first.`);
  process.exit(1);
}

const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1").get() as { id: string } | undefined;
if (!admin) throw new Error("No admin user exists");

const sourceFolder = path.resolve(folderInput);
const folderStats = await stat(sourceFolder).catch(() => null);
if (!folderStats?.isDirectory()) {
  console.error(`Folder not found: ${sourceFolder}`);
  process.exit(1);
}

const uploadRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "./storage/materials");
await mkdir(uploadRoot, { recursive: true });
const entries = await readdir(sourceFolder, { withFileTypes: true });
const files = entries.filter((entry) => entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase()));

console.log(`Importing ${files.length} supported files into ${course.code}...`);
for (const entry of files) {
  const id = randomUUID();
  const source = path.join(sourceFolder, entry.name);
  const destination = path.join(uploadRoot, `${randomUUID()}-${safeFilename(entry.name)}`);
  await copyFile(source, destination);
  const fileStats = await stat(destination);
  const extension = path.extname(entry.name).toLowerCase();
  const type = extension.match(/\.(js|jsx|ts|tsx|py|java|c|cpp|cs|go|rs|sql)$/) ? "code" : "reading";
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO materials
      (id, course_id, owner_id, title, filename, material_type, tags, visibility, file_path, byte_size, processing_status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, '[]', 'course', ?, ?, 'queued', ?, ?)`,
  ).run(id, course.id, admin.id, path.basename(entry.name, extension), entry.name, type, destination, fileStats.size, now, now);

  try {
    await ingestMaterial(id);
    console.log(`  ✓ ${entry.name}`);
  } catch (error) {
    console.error(`  ✗ ${entry.name}: ${error instanceof Error ? error.message : "failed"}`);
  }
}

console.log("Import complete.");
