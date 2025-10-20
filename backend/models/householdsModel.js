// backend/models/householdsModel.js
import pool from '../config/db.js';

export async function getAllHouseholds() {
  const q = `SELECT id, name, ward, waste_generated_per_day, contact_info, household_type,
                 ST_AsGeoJSON(location::geometry) AS location
             FROM households ORDER BY id`;
  const res = await pool.query(q);
  return res.rows;
}

export async function getHouseholdById(id) {
  const q = `SELECT id, name, ward, waste_generated_per_day, contact_info, household_type,
                    ST_AsGeoJSON(location::geometry) AS location
             FROM households WHERE id = $1`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

export async function createHousehold({ name, ward, waste_generated_per_day, lat, lng, contact_info, household_type }) {
  const q = `INSERT INTO households (name, ward, waste_generated_per_day, location, contact_info, household_type)
             VALUES ($1, $2, $3, ST_SetSRID(ST_Point($4, $5), 4326)::geography, $6, $7)
             RETURNING id, name, ward, waste_generated_per_day, contact_info, household_type, ST_AsGeoJSON(location::geometry) AS location`;
  const res = await pool.query(q, [name, ward, waste_generated_per_day || 0, lng, lat, contact_info, household_type || 'residential']);
  return res.rows[0];
}

export async function updateHousehold(id, { name, ward, waste_generated_per_day, lat, lng, contact_info, household_type }) {
  const q = `UPDATE households
             SET name = COALESCE($2, name),
                 ward = COALESCE($3, ward),
                 waste_generated_per_day = COALESCE($4, waste_generated_per_day),
                 location = COALESCE(ST_SetSRID(ST_Point($5, $6), 4326)::geography, location),
                 contact_info = COALESCE($7, contact_info),
                 household_type = COALESCE($8, household_type)
             WHERE id = $1
             RETURNING id, name, ward, waste_generated_per_day, contact_info, household_type, ST_AsGeoJSON(location::geometry) AS location`;
  const res = await pool.query(q, [id, name, ward, waste_generated_per_day, lng, lat, contact_info, household_type]);
  return res.rows[0];
}

export async function deleteHousehold(id) {
  const q = `DELETE FROM households WHERE id = $1 RETURNING id`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}
