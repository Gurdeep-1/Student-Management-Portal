import { query, queryOne, execute } from "../db/pool.js";

export async function findAll() {
  return query("SELECT * FROM marks ORDER BY id");
}

export async function findById(id) {
  return queryOne("SELECT * FROM marks WHERE id = $1", [id]);
}

export async function create({ student_name, student_id, subject, mst1, mst2, total, grade }) {
  const result = await execute(
    `INSERT INTO marks (student_name, student_id, subject, mst1, mst2, total, grade)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [student_name || "Aarav Mehta", student_id || "STU-2048", subject, mst1, mst2, total, grade]
  );
  return result.rows[0];
}

export async function update(id, { student_name, student_id, subject, mst1, mst2, total, grade }) {
  const result = await execute(
    `UPDATE marks
     SET student_name = COALESCE($1, student_name),
         student_id = COALESCE($2, student_id),
         subject = COALESCE($3, subject),
         mst1 = COALESCE($4, mst1),
         mst2 = COALESCE($5, mst2),
         total = COALESCE($6, total),
         grade = COALESCE($7, grade),
         updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [student_name, student_id, subject, mst1, mst2, total, grade, id]
  );
  return result.rows[0] || null;
}

export async function remove(id) {
  const result = await execute("DELETE FROM marks WHERE id = $1 RETURNING id", [id]);
  return result.rowCount > 0;
}
