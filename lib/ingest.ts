import { readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import JSZip from "jszip";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { getDb } from "@/lib/db";
import { createEmbeddings } from "@/lib/openai";
import { chunkText, normalizeText, type TextChunk } from "@/lib/text";

export const allowedExtensions = new Set([
  ".pdf",
  ".docx",
  ".pptx",
  ".txt",
  ".md",
  ".markdown",
  ".py",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".java",
  ".c",
  ".h",
  ".cpp",
  ".hpp",
  ".cs",
  ".go",
  ".rs",
  ".sql",
  ".html",
  ".css",
  ".json",
]);

type ExtractedDocument = {
  text: string;
  chunks: TextChunk[];
};

function decodeXmlText(xml: string): string {
  return xml
    .replace(/<a:br\s*\/>/g, "\n")
    .replace(/<\/a:p>/g, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .trim();
}

async function extractPdf(buffer: Buffer): Promise<ExtractedDocument> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const chunks = result.pages.flatMap((page) =>
      chunkText(page.text).map((chunk) => ({ ...chunk, pageNumber: page.num })),
    );
    return { text: normalizeText(result.text), chunks };
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(buffer: Buffer): Promise<ExtractedDocument> {
  const result = await mammoth.extractRawText({ buffer });
  const text = normalizeText(result.value);
  return { text, chunks: chunkText(text) };
}

async function extractPptx(buffer: Buffer): Promise<ExtractedDocument> {
  const zip = await JSZip.loadAsync(buffer);
  const slideNames = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => {
      const number = (value: string) => Number(value.match(/slide(\d+)\.xml/)?.[1] || 0);
      return number(a) - number(b);
    });

  const chunks: TextChunk[] = [];
  const pages: string[] = [];
  for (let index = 0; index < slideNames.length; index += 1) {
    const xml = await zip.file(slideNames[index])!.async("text");
    const text = normalizeText(decodeXmlText(xml));
    if (!text) continue;
    pages.push(text);
    chunks.push(...chunkText(text).map((chunk) => ({ ...chunk, pageNumber: index + 1 })));
  }
  return { text: pages.join("\n\n"), chunks };
}

export async function extractDocument(filePath: string, originalName: string): Promise<ExtractedDocument> {
  const buffer = await readFile(filePath);
  const extension = path.extname(originalName).toLowerCase();
  if (extension === ".pdf") return extractPdf(buffer);
  if (extension === ".docx") return extractDocx(buffer);
  if (extension === ".pptx") return extractPptx(buffer);

  const text = normalizeText(buffer.toString("utf8"));
  return { text, chunks: chunkText(text) };
}

export async function ingestMaterial(materialId: string): Promise<void> {
  const db = getDb();
  const material = db
    .prepare("SELECT id, file_path, filename FROM materials WHERE id = ?")
    .get(materialId) as { id: string; file_path: string | null; filename: string } | undefined;
  if (!material?.file_path) throw new Error("Material file is missing");

  db.prepare(
    "UPDATE materials SET processing_status = 'processing', error_text = NULL, updated_at = ? WHERE id = ?",
  ).run(new Date().toISOString(), materialId);

  try {
    const extracted = await extractDocument(material.file_path, material.filename);
    if (!extracted.text.trim() || !extracted.chunks.length) {
      throw new Error("No readable text was found in this file");
    }

    const limitedChunks = extracted.chunks.slice(0, 300);
    const embeddings: (number[] | null)[] = [];
    for (let start = 0; start < limitedChunks.length; start += 32) {
      const batch = limitedChunks.slice(start, start + 32);
      embeddings.push(...(await createEmbeddings(batch.map((chunk) => chunk.content))));
    }

    const now = new Date().toISOString();
    const save = db.transaction(() => {
      db.prepare("DELETE FROM material_chunks WHERE material_id = ?").run(materialId);
      const insert = db.prepare(
        `INSERT INTO material_chunks
          (id, material_id, chunk_index, page_number, content, embedding, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      );
      limitedChunks.forEach((chunk, index) => {
        insert.run(
          randomUUID(),
          materialId,
          index,
          chunk.pageNumber,
          chunk.content,
          embeddings[index] ? JSON.stringify(embeddings[index]) : null,
          now,
        );
      });
      db.prepare(
        `UPDATE materials
         SET processing_status = 'ready', word_count = ?, chunk_count = ?, error_text = NULL, updated_at = ?
         WHERE id = ?`,
      ).run(extracted.text.split(/\s+/).filter(Boolean).length, limitedChunks.length, now, materialId);
    });
    save();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown processing error";
    db.prepare(
      "UPDATE materials SET processing_status = 'failed', error_text = ?, updated_at = ? WHERE id = ?",
    ).run(message.slice(0, 500), new Date().toISOString(), materialId);
    throw error;
  }
}
