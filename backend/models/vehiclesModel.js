// backend/models/vehiclesModel.js
import pool from '../config/db.js';

export async function getAllVehicles() {
  const q = `SELECT v.id, v.license_plate, v.capacity, v.vehicle_type, v.status,
                    u.username AS assigned_user
             FROM vehicles v
             LEFT JOIN users u ON v.assigned_user_id = u.id
             ORDER BY v.id`;
  const res = await pool.query(q);
  return res.rows;
}

export async function getVehicleById(id) {
  const q = `SELECT v.id, v.license_plate, v.capacity, v.vehicle_type, v.status,
                    u.username AS assigned_user
             FROM vehicles v
             LEFT JOIN users u ON v.assigned_user_id = u.id
             WHERE v.id = $1`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

export async function createVehicle({ license_plate, capacity, vehicle_type, assigned_user_id, status }) {
  const q = `INSERT INTO vehicles (license_plate, capacity, vehicle_type, assigned_user_id, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, license_plate, capacity, vehicle_type, assigned_user_id, status`;
  const res = await pool.query(q, [license_plate, capacity, vehicle_type, assigned_user_id, status]);
  return res.rows[0];
}

export async function updateVehicle(id, { license_plate, capacity, vehicle_type, assigned_user_id, status }) {
  const q = `UPDATE vehicles
             SET license_plate = COALESCE($2, license_plate),
                 capacity = COALESCE($3, capacity),
                 vehicle_type = COALESCE($4, vehicle_type),
                 assigned_user_id = COALESCE($5, assigned_user_id),
                 status = COALESCE($6, status)
             WHERE id = $1
             RETURNING id, license_plate, capacity, vehicle_type, assigned_user_id, status`;
  const res = await pool.query(q, [id, license_plate, capacity, vehicle_type, assigned_user_id, status]);
  return res.rows[0];
}

export async function deleteVehicle(id) {
  const q = `DELETE FROM vehicles WHERE id = $1 RETURNING id`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}
