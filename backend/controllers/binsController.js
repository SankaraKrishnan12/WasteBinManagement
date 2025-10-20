import pool from '../config/db.js';

// GET all bins
export const listBins = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, capacity, last_collected, ST_AsGeoJSON(location) AS location FROM bins"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// GET single bin by ID
export const getBin = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT id, capacity, last_collected, ST_AsGeoJSON(location) AS location FROM bins WHERE id=$1",
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bin not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// POST create new bin
export const createBin = async (req, res) => {
  try {
    const { lat, lng, capacity } = req.body;
    const result = await pool.query(
      "INSERT INTO bins (capacity, last_collected, location) VALUES ($1, CURRENT_DATE, ST_SetSRID(ST_Point($2, $3), 4326)::geography) RETURNING id, capacity, last_collected, ST_AsGeoJSON(location) AS location",
      [capacity, lng, lat] // lng first, lat second
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// PUT update bin
export const updateBin = async (req, res) => {
  try {
    const { id } = req.params;
    const { lat, lng, capacity } = req.body;
    const result = await pool.query(
      "UPDATE bins SET capacity=$1, location=ST_SetSRID(ST_Point($2,$3),4326)::geography WHERE id=$4 RETURNING id, capacity, last_collected, ST_AsGeoJSON(location) AS location",
      [capacity, lng, lat, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bin not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

// DELETE bin
export const removeBin = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM bins WHERE id=$1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bin not found' });
    res.json({ message: 'Bin deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};