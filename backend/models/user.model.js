import { query, queryOne, execute } from "../db/pool.js";

export async function findByEmail(email) {
  return queryOne("SELECT * FROM users WHERE email = $1", [email]);
}

export async function findById(id) {
  return queryOne("SELECT * FROM users WHERE id = $1", [id]);
}

export async function listAll() {
  return query("SELECT id, name, email, role, student_id, program, advisor, created_at FROM users ORDER BY id");
}

export async function create({ name, email, passwordHash, role, studentId, program, advisor }) {
  const result = await execute(
    `INSERT INTO users (name, email, password_hash, role, student_id, program, advisor)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, email, role, student_id, program, advisor`,
    [name, email, passwordHash, role, studentId, program, advisor]
  );
  return result.rows[0];
}

export async function update(id, fields) {
  const setClauses = [];
  const values = [];
  let idx = 1;

  if (fields.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(fields.name); }
  if (fields.email !== undefined) { setClauses.push(`email = $${idx++}`); values.push(fields.email); }
  if (fields.passwordHash !== undefined) { setClauses.push(`password_hash = $${idx++}`); values.push(fields.passwordHash); }
  if (fields.role !== undefined) { setClauses.push(`role = $${idx++}`); values.push(fields.role); }
  if (fields.studentId !== undefined) { setClauses.push(`student_id = $${idx++}`); values.push(fields.studentId); }
  if (fields.program !== undefined) { setClauses.push(`program = $${idx++}`); values.push(fields.program); }
  if (fields.advisor !== undefined) { setClauses.push(`advisor = $${idx++}`); values.push(fields.advisor); }

  if (setClauses.length === 0) return null;

  setClauses.push(`updated_at = NOW()`);
  values.push(id);

  const result = await execute(
    `UPDATE users SET ${setClauses.join(", ")} WHERE id = $${idx} RETURNING id, name, email, role, student_id, program, advisor`,
    values
  );
  return result.rows[0] || null;
}

export async function remove(id) {
  const result = await execute("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
  return result.rowCount > 0;
}
