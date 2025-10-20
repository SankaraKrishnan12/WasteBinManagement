// backend/models/usersModel.js
import pool from '../config/db.js';

export async function getAllUsers() {
  const q = `SELECT id, username, email, role, created_at FROM users ORDER BY id`;
  const res = await pool.query(q);
  return res.rows;
}

export async function getUserById(id) {
  const q = `SELECT id, username, email, role, created_at FROM users WHERE id = $1`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

export async function createUser({ username, email, password_hash, role }) {
  const q = `INSERT INTO users (username, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, username, email, role, created_at`;
  const res = await pool.query(q, [username, email, password_hash, role]);
  return res.rows[0];
}

export async function updateUser(id, { username, email, password_hash, role }) {
  const q = `UPDATE users
             SET username = COALESCE($2, username),
                 email = COALESCE($3, email),
                 password_hash = COALESCE($4, password_hash),
                 role = COALESCE($5, role)
             WHERE id = $1
             RETURNING id, username, email, role, created_at`;
  const res = await pool.query(q, [id, username, email, password_hash, role]);
  return res.rows[0];
}

export async function deleteUser(id) {
  const q = `DELETE FROM users WHERE id = $1 RETURNING id`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}
