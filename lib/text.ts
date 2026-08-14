export type TextChunk = {
  content: string;
  index: number;
  pageNumber: number | null;
};

export function normalizeText(input: string): string {
  return input
    .replace(/\r\n/g, "\n")
    .replace(/[\t\f\v]+/g, " ")
    .replace(/ +/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function chunkText(input: string, targetSize = 1400, overlap = 180): TextChunk[] {
  const text = normalizeText(input);
  if (!text) return [];

  const paragraphs = text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    const cleaned = current.trim();
    if (cleaned) chunks.push(cleaned);
    current = "";
  };

  for (const paragraph of paragraphs) {
    if (paragraph.length > targetSize * 1.5) {
      pushCurrent();
      let start = 0;
      while (start < paragraph.length) {
        const end = Math.min(start + targetSize, paragraph.length);
        chunks.push(paragraph.slice(start, end).trim());
        if (end >= paragraph.length) break;
        start = Math.max(end - overlap, start + 1);
      }
      continue;
    }

    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length > targetSize && current) {
      const previous = current;
      pushCurrent();
      const tail = previous.slice(-overlap).trim();
      current = tail ? `${tail}\n\n${paragraph}` : paragraph;
    } else {
      current = candidate;
    }
  }

  pushCurrent();
  return chunks.map((content, index) => ({ content, index, pageNumber: null }));
}

export function tokenize(input: string): string[] {
  const lower = input.toLowerCase();
  const latin = lower.match(/[a-z0-9_+#.-]{2,}/g) ?? [];
  const chinese = lower.match(/[\u3400-\u9fff]/g) ?? [];
  return [...latin, ...chinese];
}

export function lexicalScore(query: string, content: string): number {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return 0;
  const contentTokens = new Set(tokenize(content));
  const hits = queryTokens.reduce((count, token) => count + (contentTokens.has(token) ? 1 : 0), 0);
  const exactBoost = content.toLowerCase().includes(query.toLowerCase().trim()) ? 0.35 : 0;
  return hits / queryTokens.length + exactBoost;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}
