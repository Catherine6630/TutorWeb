import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { chunkText } from "@/lib/text";

const globalForDb = globalThis as unknown as { tutorDb?: Database.Database };

function databasePath() {
  const configured = process.env.DATABASE_PATH || "./data/tutor.db";
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

function migrate(db: Database.Database) {
  const migrationPath = path.join(process.cwd(), "database", "migrations", "001_initial.sql");
  if (!existsSync(migrationPath)) {
    throw new Error(`Database migration not found at ${migrationPath}`);
  }
  db.exec(readFileSync(migrationPath, "utf8"));
}

type DemoMaterial = {
  courseCode: string;
  title: string;
  filename: string;
  type: string;
  year: string;
  tags: string[];
  content: string;
};

const demoMaterials: DemoMaterial[] = [
  {
    courseCode: "COMP101",
    title: "Lecture 03 — Control Flow & Functions",
    filename: "comp101-lecture-03-demo.md",
    type: "lecture",
    year: "2026",
    tags: ["functions", "conditionals", "loops"],
    content: `A function packages a reusable computation behind a name. A good function has a single clear responsibility, explicit inputs, and a predictable return value. Parameters are local names bound to the argument values supplied by the caller.

Conditionals select one path based on a Boolean expression. Put the most specific condition first, keep branches mutually understandable, and avoid deeply nested logic by returning early when possible.

Loops repeat work. A for-loop is a natural fit when traversing a collection or a known range. A while-loop is useful when repetition ends after a condition changes. Every loop needs a progress step and a termination argument; otherwise it may not finish.

Trace programs by recording variable values after each statement. For an off-by-one error, check the initial index, comparison operator, and final valid index.`,
  },
  {
    courseCode: "COMP101",
    title: "Practice Sheet — Python Foundations",
    filename: "comp101-practice-demo.md",
    type: "tutorial",
    year: "2026",
    tags: ["python", "practice"],
    content: `Practice task 1: Write a function that returns the largest value in a non-empty list without calling max. State the invariant maintained after each iteration.

Practice task 2: Explain why a mutable default argument can preserve state between Python function calls. Rewrite the function using None as the default.

Practice task 3: Given a loop over range(n), identify how many times the body executes and give the time complexity using Big-O notation.`,
  },
  {
    courseCode: "COMP201",
    title: "Lecture 04 — Trees & Traversal",
    filename: "comp201-lecture-04-demo.md",
    type: "lecture",
    year: "2026",
    tags: ["trees", "bst", "traversal"],
    content: `A tree is a connected acyclic graph. In a rooted tree, every node except the root has exactly one parent. The depth of a node is the number of edges from the root; the height of a node is the longest downward path to a leaf.

Depth-first traversal explores a branch before backtracking. Preorder visits node-left-right, inorder visits left-node-right, and postorder visits left-right-node. Inorder traversal of a binary search tree produces keys in sorted order when the ordering invariant holds.

Breadth-first traversal uses a queue and visits nodes level by level. Both DFS and BFS visit every node once, so their time complexity is O(n). Auxiliary space is O(h) for recursive DFS where h is tree height, and up to O(w) for BFS where w is maximum width.

A balanced binary search tree supports search, insertion, and deletion in O(log n). An unbalanced tree can degrade into a chain with O(n) operations.`,
  },
  {
    courseCode: "COMP201",
    title: "2025 Practice Exam — Algorithms",
    filename: "comp201-past-paper-demo.md",
    type: "past-paper",
    year: "2025",
    tags: ["exam", "complexity", "graphs"],
    content: `Question 1 (10 marks): Compare an array-backed list with a singly linked list for indexed access, insertion at the front, and memory locality. Justify each complexity.

Question 2 (12 marks): Trace breadth-first search from vertex A on the supplied graph. Record the queue after each vertex is processed and identify the shortest-path tree.

Question 3 (8 marks): A binary search implementation updates low = mid instead of low = mid + 1. Explain the failure mode and provide a loop invariant for the corrected algorithm.

This is original demonstration content and does not contain an official marking scheme.`,
  },
  {
    courseCode: "COMP301",
    title: "Lecture 05 — Normalisation",
    filename: "comp301-lecture-05-demo.md",
    type: "lecture",
    year: "2026",
    tags: ["database", "normalisation", "functional-dependency"],
    content: `A functional dependency X → Y states that two rows agreeing on attributes X must also agree on attributes Y. A superkey functionally determines every attribute in the relation; a candidate key is a minimal superkey.

First normal form requires atomic attribute values. Second normal form removes partial dependency of a non-prime attribute on part of a candidate key. Third normal form removes transitive dependency of non-prime attributes on a key.

BCNF requires that every determinant in a non-trivial functional dependency is a superkey. Decomposition should be lossless so the original relation can be reconstructed by joining, and ideally dependency-preserving so constraints can be checked without a join.

Normalisation reduces update, insertion, and deletion anomalies, but query performance and workload requirements still matter when designing a production schema.`,
  },
  {
    courseCode: "COMP301",
    title: "SQL Query Clinic",
    filename: "comp301-sql-clinic-demo.md",
    type: "tutorial",
    year: "2026",
    tags: ["sql", "joins", "group-by"],
    content: `An INNER JOIN keeps rows with a matching join condition on both sides. A LEFT JOIN keeps every row from the left table and fills unmatched right-side columns with NULL.

WHERE filters rows before grouping; HAVING filters groups after GROUP BY. Every selected expression that is neither aggregated nor functionally dependent on the grouping key normally belongs in GROUP BY.

Indexes can reduce reads for selective predicates and joins, but they add storage and write cost. Check the query plan rather than assuming an index will be used. Composite index order should reflect the leading predicates and sort requirements of important queries.`,
  },
];

function seedIfEmpty(db: Database.Database) {
  const existing = db.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number };
  if (existing.count > 0) return;

  const now = new Date().toISOString();
  const studentId = randomUUID();
  const adminId = randomUUID();
  const insertUser = db.prepare(
    "INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  );
  insertUser.run(studentId, "Alex Chen", "student@tutorly.local", bcrypt.hashSync("Student123!", 10), "student", now);
  insertUser.run(adminId, "Mia Admin", "admin@tutorly.local", bcrypt.hashSync("Admin123!", 10), "admin", now);

  const courses = [
    {
      id: randomUUID(),
      code: "COMP101",
      name: "Programming Fundamentals",
      description: "Build a strong foundation in problem solving, Python, functions, data structures, and program design.",
      term: "Semester 1 · 2026",
      accent: "#6d5dfc",
      icon: "terminal-square",
      progress: 68,
    },
    {
      id: randomUUID(),
      code: "COMP201",
      name: "Data Structures & Algorithms",
      description: "Understand core data structures, algorithmic thinking, complexity, trees, graphs, and searching.",
      term: "Semester 1 · 2026",
      accent: "#0d9f8f",
      icon: "network",
      progress: 43,
    },
    {
      id: randomUUID(),
      code: "COMP301",
      name: "Database Systems",
      description: "Model reliable data, write expressive SQL, reason about normalisation, transactions, and indexes.",
      term: "Semester 2 · 2026",
      accent: "#ed8b45",
      icon: "database",
      progress: 24,
    },
  ];

  const insertCourse = db.prepare(
    "INSERT INTO courses (id, code, name, description, term, accent, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const enroll = db.prepare("INSERT INTO enrollments (user_id, course_id, progress, created_at) VALUES (?, ?, ?, ?)");
  for (const course of courses) {
    insertCourse.run(course.id, course.code, course.name, course.description, course.term, course.accent, course.icon, now, now);
    enroll.run(studentId, course.id, course.progress, now);
    enroll.run(adminId, course.id, 0, now);
  }

  const insertMaterial = db.prepare(
    `INSERT INTO materials
      (id, course_id, owner_id, title, filename, material_type, year, tags, visibility, processing_status, word_count, chunk_count, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'course', 'ready', ?, ?, ?, ?)`,
  );
  const insertChunk = db.prepare(
    "INSERT INTO material_chunks (id, material_id, chunk_index, page_number, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  );

  for (const material of demoMaterials) {
    const course = courses.find((item) => item.code === material.courseCode)!;
    const materialId = randomUUID();
    const chunks = chunkText(material.content, 900, 120);
    insertMaterial.run(
      materialId,
      course.id,
      adminId,
      material.title,
      material.filename,
      material.type,
      material.year,
      JSON.stringify(material.tags),
      material.content.split(/\s+/).filter(Boolean).length,
      chunks.length,
      now,
      now,
    );
    for (const chunk of chunks) {
      insertChunk.run(randomUUID(), materialId, chunk.index, chunk.pageNumber, chunk.content, now);
    }
  }

  db.prepare("INSERT INTO ai_configuration (key, value, updated_at) VALUES ('system_prompt_version', '1', ?)").run(now);
}

export function getDb(): Database.Database {
  if (globalForDb.tutorDb) return globalForDb.tutorDb;

  const filename = databasePath();
  mkdirSync(path.dirname(filename), { recursive: true });
  const db = new Database(filename);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  migrate(db);

  const seed = db.transaction(() => seedIfEmpty(db));
  seed();

  globalForDb.tutorDb = db;
  return db;
}

export function resetDemoDatabase() {
  const db = getDb();
  db.exec(`
    DELETE FROM message_citations;
    DELETE FROM messages;
    DELETE FROM conversations;
    DELETE FROM material_chunks;
    DELETE FROM materials;
    DELETE FROM enrollments;
    DELETE FROM sessions;
    DELETE FROM users;
    DELETE FROM courses;
    DELETE FROM usage_records;
    DELETE FROM ai_configuration;
  `);
  seedIfEmpty(db);
}
