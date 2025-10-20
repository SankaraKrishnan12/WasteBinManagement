// backend/models/maintenanceModel.js
import pool from '../config/db.js';

export async function getAllMaintenance() {
  const q = `SELECT m.id, m.bin_id, m.scheduled_date, m.completed_date, m.maintenance_type,
                    m.description, m.technician_id, m.cost, m.status,
                    b.capacity AS bin_capacity,
                    u.username AS technician
             FROM maintenance m
             LEFT JOIN bins b ON m.bin_id = b.id
             LEFT JOIN users u ON m.technician_id = u.id
             ORDER BY m.scheduled_date DESC`;
  const res = await pool.query(q);
  return res.rows;
}

export async function getMaintenanceById(id) {
  const q = `SELECT m.id, m.bin_id, m.scheduled_date, m.completed_date, m.maintenance_type,
                    m.description, m.technician_id, m.cost, m.status,
                    b.capacity AS bin_capacity,
                    u.username AS technician
             FROM maintenance m
             LEFT JOIN bins b ON m.bin_id = b.id
             LEFT JOIN users u ON m.technician_id = u.id
             WHERE m.id = $1`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

export async function createMaintenance({ bin_id, scheduled_date, maintenance_type, description, technician_id, cost, status }) {
  const q = `INSERT INTO maintenance (bin_id, scheduled_date, maintenance_type, description, technician_id, cost, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, bin_id, scheduled_date, completed_date, maintenance_type, description, technician_id, cost, status`;
  const res = await pool.query(q, [bin_id, scheduled_date, maintenance_type, description, technician_id, cost, status]);
  return res.rows[0];
}

export async function updateMaintenance(id, { bin_id, scheduled_date, completed_date, maintenance_type, description, technician_id, cost, status }) {
  const q = `UPDATE maintenance
             SET bin_id = COALESCE($2, bin_id),
                 scheduled_date = COALESCE($3, scheduled_date),
                 completed_date = COALESCE($4, completed_date),
                 maintenance_type = COALESCE($5, maintenance_type),
                 description = COALESCE($6, description),
                 technician_id = COALESCE($7, technician_id),
                 cost = COALESCE($8, cost),
                 status = COALESCE($9, status)
             WHERE id = $1
             RETURNING id, bin_id, scheduled_date, completed_date, maintenance_type, description, technician_id, cost, status`;
  const res = await pool.query(q, [id, bin_id, scheduled_date, completed_date, maintenance_type, description, technician_id, cost, status]);
  return res.rows[0];
}

export async function deleteMaintenance(id) {
  const q = `DELETE FROM maintenance WHERE id = $1 RETURNING id`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}
