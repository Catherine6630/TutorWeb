import { getDb } from "../lib/db";

const db = getDb();
const counts = {
  users: (db.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number }).count,
  courses: (db.prepare("SELECT COUNT(*) AS count FROM courses").get() as { count: number }).count,
  materials: (db.prepare("SELECT COUNT(*) AS count FROM materials").get() as { count: number }).count,
};

console.log(`Tutorly database ready: ${counts.users} users, ${counts.courses} courses, ${counts.materials} materials.`);
