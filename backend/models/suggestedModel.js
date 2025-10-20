// backend/models/suggestedModel.js
import pool from '../config/db.js';

export async function getAllSuggested() {
  const q = `SELECT id, reason, ST_AsGeoJSON(location::geometry) AS location FROM suggested_bins ORDER BY id`;
  const res = await pool.query(q);
  return res.rows;
}

export async function insertSuggested({ reason, lat, lng }) {
  const q = `INSERT INTO suggested_bins (reason, location)
             VALUES ($1, ST_SetSRID(ST_Point($2, $3), 4326)::geography)
             RETURNING id, reason, ST_AsGeoJSON(location::geometry) AS location`;
  const res = await pool.query(q, [reason, lng, lat]); // note: ST_Point(lon, lat)
  return res.rows[0];
}

export async function clearSuggested() {
  const q = `TRUNCATE suggested_bins RESTART IDENTITY`;
  await pool.query(q);
  return true;
}
