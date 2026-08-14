import OpenAI from "openai";

let client: OpenAI | null | undefined;

export function isAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAIClient(): OpenAI | null {
  if (client !== undefined) return client;
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  client = apiKey ? new OpenAI({ apiKey }) : null;
  return client;
}

export function getChatModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-5.6-sol";
}

export async function createEmbedding(input: string): Promise<number[] | null> {
  const embeddings = await createEmbeddings([input]);
  return embeddings[0] ?? null;
}

export async function createEmbeddings(inputs: string[]): Promise<(number[] | null)[]> {
  const openai = getOpenAIClient();
  if (!openai || !inputs.length) return inputs.map(() => null);

  try {
    const response = await openai.embeddings.create({
      model: process.env.OPENAI_EMBEDDING_MODEL?.trim() || "text-embedding-3-small",
      input: inputs.map((input) => input.slice(0, 18_000)),
      encoding_format: "float",
    });
    return inputs.map((_, index) => response.data[index]?.embedding ?? null);
  } catch (error) {
    console.error("Embedding request failed", error instanceof Error ? error.message : error);
    return inputs.map(() => null);
  }
}
