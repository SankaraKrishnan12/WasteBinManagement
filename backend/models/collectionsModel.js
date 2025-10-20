// backend/models/collectionsModel.js
import pool from '../config/db.js';

export async function getAllCollections() {
  const q = `SELECT c.id, c.bin_id, c.vehicle_id, c.collector_id, c.collected_at,
                    c.waste_amount_collected, c.notes,
                    b.capacity AS bin_capacity,
                    v.license_plate,
                    u.username AS collector,
                    wt.name AS waste_type
             FROM collections c
             LEFT JOIN bins b ON c.bin_id = b.id
             LEFT JOIN vehicles v ON c.vehicle_id = v.id
             LEFT JOIN users u ON c.collector_id = u.id
             LEFT JOIN waste_types wt ON c.waste_type_id = wt.id
             ORDER BY c.collected_at DESC`;
  const res = await pool.query(q);
  return res.rows;
}

export async function getCollectionById(id) {
  const q = `SELECT c.id, c.bin_id, c.vehicle_id, c.collector_id, c.collected_at,
                    c.waste_amount_collected, c.notes,
                    b.capacity AS bin_capacity,
                    v.license_plate,
                    u.username AS collector,
                    wt.name AS waste_type
             FROM collections c
             LEFT JOIN bins b ON c.bin_id = b.id
             LEFT JOIN vehicles v ON c.vehicle_id = v.id
             LEFT JOIN users u ON c.collector_id = u.id
             LEFT JOIN waste_types wt ON c.waste_type_id = wt.id
             WHERE c.id = $1`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}

export async function createCollection({ bin_id, vehicle_id, collector_id, waste_amount_collected, waste_type_id, notes }) {
  const q = `INSERT INTO collections (bin_id, vehicle_id, collector_id, waste_amount_collected, waste_type_id, notes)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, bin_id, vehicle_id, collector_id, collected_at, waste_amount_collected, waste_type_id, notes`;
  const res = await pool.query(q, [bin_id, vehicle_id, collector_id, waste_amount_collected, waste_type_id, notes]);
  return res.rows[0];
}

export async function updateCollection(id, { bin_id, vehicle_id, collector_id, waste_amount_collected, waste_type_id, notes }) {
  const q = `UPDATE collections
             SET bin_id = COALESCE($2, bin_id),
                 vehicle_id = COALESCE($3, vehicle_id),
                 collector_id = COALESCE($4, collector_id),
                 waste_amount_collected = COALESCE($5, waste_amount_collected),
                 waste_type_id = COALESCE($6, waste_type_id),
                 notes = COALESCE($7, notes)
             WHERE id = $1
             RETURNING id, bin_id, vehicle_id, collector_id, collected_at, waste_amount_collected, waste_type_id, notes`;
  const res = await pool.query(q, [id, bin_id, vehicle_id, collector_id, waste_amount_collected, waste_type_id, notes]);
  return res.rows[0];
}

export async function deleteCollection(id) {
  const q = `DELETE FROM collections WHERE id = $1 RETURNING id`;
  const res = await pool.query(q, [id]);
  return res.rows[0];
}
