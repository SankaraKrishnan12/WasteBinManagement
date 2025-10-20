// backend/models/assignmentsModel.js
import pool from '../config/db.js';

export async function getAllAssignments() {
  const q = `SELECT a.id, a.household_id, a.bin_id, a.assigned_date, a.priority,
                    h.name AS household_name, h.ward,
                    b.capacity AS bin_capacity, b.fill_level
             FROM household_bin_assignments a
             JOIN households h ON a.household_id = h.id
             JOIN bins b ON a.bin_id = b.id
             ORDER BY a.assigned_date DESC`;
  const res = await pool.query(q);
  return res.rows;
}

export async function getAssignmentById(id) {
  const q = `SELECT a.id, a.household_id, a.bin_id, a.assigned_date, a.priority,
                    h.name AS household_name, h.ward,
                    b.capacity AS bin_capacity, b.fill_level
             FROM household_bin_assignments a
             JOIN households h ON a.household_id = h.id
             JOIN bins b ON a.bin_id = b.id
             WHERE a.id = $1`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

export async function createAssignment({ household_id, bin_id, priority }) {
  const q = `INSERT INTO household_bin_assignments (household_id, bin_id, priority)
             VALUES ($1, $2, $3)
             RETURNING id, household_id, bin_id, assigned_date, priority`;
  const res = await pool.query(q, [household_id, bin_id, priority]);
  return res.rows[0];
}

export async function updateAssignment(id, { household_id, bin_id, priority }) {
  const q = `UPDATE household_bin_assignments
             SET household_id = COALESCE($2, household_id),
                 bin_id = COALESCE($3, bin_id),
                 priority = COALESCE($4, priority)
             WHERE id = $1
             RETURNING id, household_id, bin_id, assigned_date, priority`;
  const res = await pool.query(q, [id, household_id, bin_id, priority]);
  return res.rows[0];
}

export async function deleteAssignment(id) {
  const q = `DELETE FROM household_bin_assignments WHERE id = $1 RETURNING id`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

export async function getAssignmentsByHousehold(householdId) {
  const q = `SELECT a.id, a.bin_id, a.assigned_date, a.priority,
                    b.capacity, b.fill_level, b.status,
                    ST_AsGeoJSON(b.location::geometry) AS location
             FROM household_bin_assignments a
             JOIN bins b ON a.bin_id = b.id
             WHERE a.household_id = $1
             ORDER BY a.priority`;
  const res = await pool.query(q, [householdId]);
  return res.rows;
}

export async function getAssignmentsByBin(binId) {
  const q = `SELECT a.id, a.household_id, a.assigned_date, a.priority,
                    h.name, h.ward, h.waste_generated_per_day,
                    ST_AsGeoJSON(h.location::geometry) AS location
             FROM household_bin_assignments a
             JOIN households h ON a.household_id = h.id
             WHERE a.bin_id = $1
             ORDER BY a.priority`;
  const res = await pool.query(q, [binId]);
  return res.rows;
}
