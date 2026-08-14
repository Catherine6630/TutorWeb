import { getDb } from "@/lib/db";
import { parseJsonArray } from "@/lib/utils";
import type {
  AuthUser,
  ChatMessage,
  Citation,
  ConversationSummary,
  Course,
  Material,
} from "@/lib/models";

type CourseRow = {
  id: string;
  code: string;
  name: string;
  description: string;
  term: string | null;
  accent: string;
  icon: string;
  progress: number;
  material_count: number;
};

export function getCoursesForUser(user: AuthUser): Course[] {
  const rows = getDb()
    .prepare(
      `SELECT c.id, c.code, c.name, c.description, c.term, c.accent, c.icon,
              COALESCE(e.progress, 0) AS progress,
              COUNT(DISTINCT m.id) AS material_count
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id AND e.user_id = ?
       LEFT JOIN materials m ON m.course_id = c.id AND m.processing_status = 'ready'
       WHERE c.is_archived = 0 AND (? = 'admin' OR e.user_id IS NOT NULL)
       GROUP BY c.id
       ORDER BY c.code`,
    )
    .all(user.id, user.role) as CourseRow[];

  return rows.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    term: row.term,
    accent: row.accent,
    icon: row.icon,
    progress: row.progress,
    materialCount: row.material_count,
  }));
}

export function getCourseForUser(user: AuthUser, courseId: string): Course | null {
  return getCoursesForUser(user).find((course) => course.id === courseId) ?? null;
}

type MaterialRow = {
  id: string;
  course_id: string;
  course_code: string;
  course_name: string;
  owner_id: string | null;
  title: string;
  filename: string;
  material_type: string;
  year: string | null;
  tags: string;
  visibility: "course" | "private";
  file_path: string | null;
  mime_type: string | null;
  byte_size: number;
  processing_status: "queued" | "processing" | "ready" | "failed";
  error_text: string | null;
  word_count: number;
  chunk_count: number;
  created_at: string;
  updated_at: string;
};

function toMaterial(row: MaterialRow): Material {
  return {
    id: row.id,
    courseId: row.course_id,
    courseCode: row.course_code,
    courseName: row.course_name,
    ownerId: row.owner_id,
    title: row.title,
    filename: row.filename,
    materialType: row.material_type,
    year: row.year,
    tags: parseJsonArray(row.tags),
    visibility: row.visibility,
    filePath: row.file_path,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    processingStatus: row.processing_status,
    errorText: row.error_text,
    wordCount: row.word_count,
    chunkCount: row.chunk_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getMaterialsForUser(user: AuthUser, courseId?: string): Material[] {
  const courseFilter = courseId ? " AND m.course_id = ?" : "";
  const rows = getDb()
    .prepare(
      `SELECT m.*, c.code AS course_code, c.name AS course_name
       FROM materials m
       JOIN courses c ON c.id = m.course_id
       LEFT JOIN enrollments e ON e.course_id = c.id AND e.user_id = ?
       WHERE (? = 'admin' OR e.user_id IS NOT NULL)
         AND (m.visibility = 'course' OR m.owner_id = ?)
         ${courseFilter}
       ORDER BY m.created_at DESC`,
    )
    .all(user.id, user.role, user.id, ...(courseId ? [courseId] : [])) as MaterialRow[];
  return rows.map(toMaterial);
}

export function getRecentConversations(userId: string, limit = 8): ConversationSummary[] {
  const rows = getDb()
    .prepare(
      `SELECT v.id, v.title, v.course_id, c.code AS course_code, v.learning_mode, v.updated_at
       FROM conversations v
       LEFT JOIN courses c ON c.id = v.course_id
       WHERE v.user_id = ?
       ORDER BY v.updated_at DESC
       LIMIT ?`,
    )
    .all(userId, limit) as {
    id: string;
    title: string;
    course_id: string | null;
    course_code: string | null;
    learning_mode: string;
    updated_at: string;
  }[];
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    courseId: row.course_id,
    courseCode: row.course_code,
    learningMode: row.learning_mode,
    updatedAt: row.updated_at,
  }));
}

export function getConversation(userId: string, conversationId: string) {
  const conversation = getDb()
    .prepare(
      `SELECT v.id, v.title, v.course_id, c.code AS course_code, v.learning_mode, v.updated_at
       FROM conversations v LEFT JOIN courses c ON c.id = v.course_id
       WHERE v.id = ? AND v.user_id = ?`,
    )
    .get(conversationId, userId) as
    | {
        id: string;
        title: string;
        course_id: string | null;
        course_code: string | null;
        learning_mode: string;
        updated_at: string;
      }
    | undefined;
  if (!conversation) return null;

  const messageRows = getDb()
    .prepare(
      "SELECT id, role, content, model, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at, rowid",
    )
    .all(conversationId) as {
    id: string;
    role: "user" | "assistant";
    content: string;
    model: string | null;
    created_at: string;
  }[];

  const citationStatement = getDb().prepare(
    `SELECT mc.id, mc.chunk_id, mc.material_id, mc.label, mc.snippet, mc.page_number,
            m.title AS material_title, c.code AS course_code
     FROM message_citations mc
     JOIN materials m ON m.id = mc.material_id
     JOIN courses c ON c.id = m.course_id
     WHERE mc.message_id = ? ORDER BY mc.label`,
  );

  const messages: ChatMessage[] = messageRows.map((message) => {
    const citations = citationStatement.all(message.id) as {
      id: string;
      chunk_id: string;
      material_id: string;
      label: string;
      snippet: string;
      page_number: number | null;
      material_title: string;
      course_code: string;
    }[];
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      model: message.model,
      createdAt: message.created_at,
      citations: citations.map(
        (citation): Citation => ({
          id: citation.id,
          sourceIndex: Number(citation.label.replace("S", "")) || 1,
          chunkId: citation.chunk_id,
          materialId: citation.material_id,
          materialTitle: citation.material_title,
          courseCode: citation.course_code,
          pageNumber: citation.page_number,
          snippet: citation.snippet,
        }),
      ),
    };
  });

  return {
    id: conversation.id,
    title: conversation.title,
    courseId: conversation.course_id,
    courseCode: conversation.course_code,
    learningMode: conversation.learning_mode,
    updatedAt: conversation.updated_at,
    messages,
  };
}

export function getDashboardMetrics(user: AuthUser) {
  const db = getDb();
  const conversations = db.prepare("SELECT COUNT(*) AS count FROM conversations WHERE user_id = ?").get(user.id) as {
    count: number;
  };
  const messages = db
    .prepare(
      `SELECT COUNT(*) AS count FROM messages m JOIN conversations c ON c.id = m.conversation_id
       WHERE c.user_id = ? AND m.role = 'user'`,
    )
    .get(user.id) as { count: number };
  const bookmarks = db.prepare("SELECT COUNT(*) AS count FROM bookmarks WHERE user_id = ?").get(user.id) as {
    count: number;
  };
  return { conversations: conversations.count, questions: messages.count, bookmarks: bookmarks.count };
}

export function getAdminMetrics() {
  const db = getDb();
  const scalar = (sql: string) => (db.prepare(sql).get() as { count: number }).count;
  const usage = db
    .prepare("SELECT COALESCE(SUM(input_tokens + output_tokens), 0) AS count FROM usage_records")
    .get() as { count: number };
  return {
    users: scalar("SELECT COUNT(*) AS count FROM users"),
    courses: scalar("SELECT COUNT(*) AS count FROM courses WHERE is_archived = 0"),
    materials: scalar("SELECT COUNT(*) AS count FROM materials"),
    conversations: scalar("SELECT COUNT(*) AS count FROM conversations"),
    tokens: usage.count,
  };
}

export function getBookmarks(userId: string) {
  const rows = getDb()
    .prepare(
      `SELECT b.message_id, b.created_at AS bookmarked_at, m.content, m.created_at,
              v.id AS conversation_id, v.title AS conversation_title,
              c.code AS course_code
       FROM bookmarks b
       JOIN messages m ON m.id = b.message_id
       JOIN conversations v ON v.id = m.conversation_id
       LEFT JOIN courses c ON c.id = v.course_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
    )
    .all(userId) as {
    message_id: string;
    bookmarked_at: string;
    content: string;
    created_at: string;
    conversation_id: string;
    conversation_title: string;
    course_code: string | null;
  }[];
  return rows.map((row) => ({
    messageId: row.message_id,
    bookmarkedAt: row.bookmarked_at,
    content: row.content,
    createdAt: row.created_at,
    conversationId: row.conversation_id,
    conversationTitle: row.conversation_title,
    courseCode: row.course_code,
  }));
}
