// backend/models/binsModel.js
import pool from '../config/db.js';

export async function getAllBins() {
  const q = `SELECT id, capacity, last_collected, bin_type, fill_level, status,
                    ST_AsGeoJSON(location::geometry) AS location
             FROM bins ORDER BY id`;
  const res = await pool.query(q);
  return res.rows;
}

export async function getBinById(id) {
  const q = `SELECT id, capacity, last_collected, bin_type, fill_level, status,
                    ST_AsGeoJSON(location::geometry) AS location
             FROM bins WHERE id = $1`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

export async function createBin({ capacity, last_collected, lat, lng, bin_type, fill_level, status }) {
  const q = `INSERT INTO bins (capacity, last_collected, location, bin_type, fill_level, status)
             VALUES ($1, $2, ST_SetSRID(ST_Point($3, $4), 4326)::geography, $5, $6, $7)
             RETURNING id, capacity, last_collected, bin_type, fill_level, status, ST_AsGeoJSON(location::geometry) AS location`;
  const res = await pool.query(q, [capacity || 100, last_collected || null, lng, lat, bin_type || 'standard', fill_level || 0, status || 'active']);
  return res.rows[0];
}

export async function updateBin(id, { capacity, last_collected, lat, lng, bin_type, fill_level, status }) {
  const q = `UPDATE bins
             SET capacity = COALESCE($2, capacity),
                 last_collected = COALESCE($3, last_collected),
                 location = COALESCE(ST_SetSRID(ST_Point($4, $5), 4326)::geography, location),
                 bin_type = COALESCE($6, bin_type),
                 fill_level = COALESCE($7, fill_level),
                 status = COALESCE($8, status)
             WHERE id = $1
             RETURNING id, capacity, last_collected, bin_type, fill_level, status, ST_AsGeoJSON(location::geometry) AS location`;
  const res = await pool.query(q, [id, capacity, last_collected, lng, lat, bin_type, fill_level, status]);
  return res.rows[0];
}

export async function deleteBin(id) {
  const q = `DELETE FROM bins WHERE id = $1 RETURNING id`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}
