export type UserRole = "student" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type Course = {
  id: string;
  code: string;
  name: string;
  description: string;
  term: string | null;
  accent: string;
  icon: string;
  progress?: number;
  materialCount?: number;
};

export type Material = {
  id: string;
  courseId: string;
  courseCode?: string;
  courseName?: string;
  ownerId: string | null;
  title: string;
  filename: string;
  materialType: string;
  year: string | null;
  tags: string[];
  visibility: "course" | "private";
  filePath: string | null;
  mimeType: string | null;
  byteSize: number;
  processingStatus: "queued" | "processing" | "ready" | "failed";
  errorText: string | null;
  wordCount: number;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ConversationSummary = {
  id: string;
  title: string;
  courseId: string | null;
  courseCode: string | null;
  learningMode: string;
  updatedAt: string;
};

export type Citation = {
  id?: string;
  sourceIndex: number;
  chunkId: string;
  materialId: string;
  materialTitle: string;
  courseCode: string;
  pageNumber: number | null;
  snippet: string;
  score?: number;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  model: string | null;
  createdAt: string;
  citations: Citation[];
};
