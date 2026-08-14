import { describe, expect, it } from "vitest";
import { chunkText, cosineSimilarity, lexicalScore, normalizeText, tokenize } from "@/lib/text";

describe("text utilities", () => {
  it("normalizes whitespace without losing paragraphs", () => {
    expect(normalizeText(" hello   world\r\n\r\n\r\nnext ")).toBe("hello world\n\nnext");
  });

  it("creates overlapping chunks for long material", () => {
    const input = Array.from({ length: 14 }, (_, index) => `Paragraph ${index}: ${"algorithm ".repeat(24)}`).join("\n\n");
    const chunks = chunkText(input, 420, 60);
    expect(chunks.length).toBeGreaterThan(2);
    expect(chunks.every((chunk) => chunk.content.length > 0)).toBe(true);
    expect(chunks.map((chunk) => chunk.index)).toEqual(chunks.map((_, index) => index));
  });

  it("tokenizes English identifiers and Chinese characters", () => {
    expect(tokenize("Binary_Search 二叉树")).toEqual(expect.arrayContaining(["binary_search", "二", "叉", "树"]));
  });

  it("ranks a relevant source above an unrelated source", () => {
    const query = "binary search tree complexity";
    expect(lexicalScore(query, "A balanced binary search tree has logarithmic search complexity."))
      .toBeGreaterThan(lexicalScore(query, "Relational databases support SQL joins."));
  });

  it("calculates cosine similarity", () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });
});
