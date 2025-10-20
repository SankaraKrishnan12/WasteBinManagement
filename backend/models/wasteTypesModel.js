// backend/models/wasteTypesModel.js
import pool from '../config/db.js';

export async function getAllWasteTypes() {
  const q = `SELECT id, name, description, recyclable FROM waste_types ORDER BY id`;
  const res = await pool.query(q);
  return res.rows;
}

export async function getWasteTypeById(id) {
  const q = `SELECT id, name, description, recyclable FROM waste_types WHERE id = $1`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

export async function createWasteType({ name, description, recyclable }) {
  const q = `INSERT INTO waste_types (name, description, recyclable)
             VALUES ($1, $2, $3)
             RETURNING id, name, description, recyclable`;
  const res = await pool.query(q, [name, description, recyclable]);
  return res.rows[0];
}

export async function updateWasteType(id, { name, description, recyclable }) {
  const q = `UPDATE waste_types
             SET name = COALESCE($2, name),
                 description = COALESCE($3, description),
                 recyclable = COALESCE($4, recyclable)
             WHERE id = $1
             RETURNING id, name, description, recyclable`;
  const res = await pool.query(q, [id, name, description, recyclable]);
  return res.rows[0];
}

export async function deleteWasteType(id) {
  const q = `DELETE FROM waste_types WHERE id = $1 RETURNING id`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}
