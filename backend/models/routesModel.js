// backend/models/routesModel.js
import pool from '../config/db.js';

export async function getAllRoutes() {
  const q = `SELECT r.id, r.name, r.description, r.created_by, r.created_at,
                    r.estimated_duration, r.status,
                    u.username AS creator,
                    COUNT(rb.bin_id) AS bins_in_route
             FROM routes r
             LEFT JOIN users u ON r.created_by = u.id
             LEFT JOIN route_bins rb ON r.id = rb.route_id
             GROUP BY r.id, r.name, r.description, r.created_by, r.created_at, r.estimated_duration, r.status, u.username
             ORDER BY r.created_at DESC`;
  const res = await pool.query(q);
  return res.rows;
}

export async function getRouteById(id) {
  const q = `SELECT r.id, r.name, r.description, r.created_by, r.created_at,
                    r.estimated_duration, r.status,
                    u.username AS creator
             FROM routes r
             LEFT JOIN users u ON r.created_by = u.id
             WHERE r.id = $1`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

export async function getRouteBins(routeId) {
  const q = `SELECT rb.id, rb.route_id, rb.bin_id, rb.sequence_order, rb.estimated_arrival_time,
                    b.capacity, b.fill_level, b.status,
                    ST_AsGeoJSON(b.location::geometry) AS location
             FROM route_bins rb
             JOIN bins b ON rb.bin_id = b.id
             WHERE rb.route_id = $1
             ORDER BY rb.sequence_order`;
  const res = await pool.query(q, [routeId]);
  return res.rows;
}

export async function createRoute({ name, description, created_by, estimated_duration, status }) {
  const q = `INSERT INTO routes (name, description, created_by, estimated_duration, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, description, created_by, created_at, estimated_duration, status`;
  const res = await pool.query(q, [name, description, created_by, estimated_duration, status]);
  return res.rows[0];
}

export async function updateRoute(id, { name, description, estimated_duration, status }) {
  const q = `UPDATE routes
             SET name = COALESCE($2, name),
                 description = COALESCE($3, description),
                 estimated_duration = COALESCE($4, estimated_duration),
                 status = COALESCE($5, status)
             WHERE id = $1
             RETURNING id, name, description, created_by, created_at, estimated_duration, status`;
  const res = await pool.query(q, [id, name, description, estimated_duration, status]);
  return res.rows[0];
}

export async function deleteRoute(id) {
  const q = `DELETE FROM routes WHERE id = $1 RETURNING id`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

export async function addBinToRoute(routeId, binId, sequenceOrder, estimatedArrivalTime) {
  const q = `INSERT INTO route_bins (route_id, bin_id, sequence_order, estimated_arrival_time)
             VALUES ($1, $2, $3, $4)
             RETURNING id, route_id, bin_id, sequence_order, estimated_arrival_time`;
  const res = await pool.query(q, [routeId, binId, sequenceOrder, estimatedArrivalTime]);
  return res.rows[0];
}

export async function removeBinFromRoute(routeId, binId) {
  const q = `DELETE FROM route_bins WHERE route_id = $1 AND bin_id = $2 RETURNING id`;
  const res = await pool.query(q, [routeId, binId]);
  return res.rows[0];
}
