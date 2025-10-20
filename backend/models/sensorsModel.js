// backend/models/sensorsModel.js
import pool from '../config/db.js';

export async function getAllSensors() {
  const q = `SELECT s.id, s.bin_id, s.sensor_type, s.last_reading, s.last_reading_time,
                    s.battery_level, s.status,
                    b.capacity AS bin_capacity, b.fill_level
             FROM sensors s
             JOIN bins b ON s.bin_id = b.id
             ORDER BY s.id`;
  const res = await pool.query(q);
  return res.rows;
}

export async function getSensorById(id) {
  const q = `SELECT s.id, s.bin_id, s.sensor_type, s.last_reading, s.last_reading_time,
                    s.battery_level, s.status,
                    b.capacity AS bin_capacity, b.fill_level
             FROM sensors s
             JOIN bins b ON s.bin_id = b.id
             WHERE s.id = $1`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

export async function createSensor({ bin_id, sensor_type, last_reading, last_reading_time, battery_level, status }) {
  const q = `INSERT INTO sensors (bin_id, sensor_type, last_reading, last_reading_time, battery_level, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, bin_id, sensor_type, last_reading, last_reading_time, battery_level, status`;
  const res = await pool.query(q, [bin_id, sensor_type, last_reading, last_reading_time, battery_level, status]);
  return res.rows[0];
}

export async function updateSensor(id, { bin_id, sensor_type, last_reading, last_reading_time, battery_level, status }) {
  const q = `UPDATE sensors
             SET bin_id = COALESCE($2, bin_id),
                 sensor_type = COALESCE($3, sensor_type),
                 last_reading = COALESCE($4, last_reading),
                 last_reading_time = COALESCE($5, last_reading_time),
                 battery_level = COALESCE($6, battery_level),
                 status = COALESCE($7, status)
             WHERE id = $1
             RETURNING id, bin_id, sensor_type, last_reading, last_reading_time, battery_level, status`;
  const res = await pool.query(q, [id, bin_id, sensor_type, last_reading, last_reading_time, battery_level, status]);
  return res.rows[0];
}

export async function deleteSensor(id) {
  const q = `DELETE FROM sensors WHERE id = $1 RETURNING id`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}
