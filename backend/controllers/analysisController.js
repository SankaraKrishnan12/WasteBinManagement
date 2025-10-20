import pool from '../config/db.js';

// GET households not within `dist` meters of any bin
export async function farHouseholds(req, res) {
  try {
    const dist = Number(req.query.dist) || 300;
    const q = `
      SELECT id, name, ward, waste_generated_per_day,
             ST_AsGeoJSON(location::geometry) AS location
      FROM households h
      WHERE NOT EXISTS (
        SELECT 1 FROM bins b
        WHERE ST_DWithin(h.location::geography, b.location::geography, $1)
      );
    `;
    const result = await pool.query(q, [dist]);
    res.json(result.rows);
  } catch (err) {
    console.error('farHouseholds error', err);
    res.status(500).json({ error: 'Failed to run farHouseholds query' });
  }
}

// POST generate suggested bins (centroid of uncovered households)
export async function suggestBins(req, res) {
  try {
    const dist = Number(req.body.dist) || 300;

    const qInsert = `
      INSERT INTO suggested_bins (reason, location)
      SELECT 'Uncovered centroid',
             ST_SetSRID(
               ST_Point(
                 ST_X(ST_Centroid(ST_Collect(h.location::geometry))),
                 ST_Y(ST_Centroid(ST_Collect(h.location::geometry)))
               ),
               4326
             )::geography
      FROM households h
      WHERE NOT EXISTS (
        SELECT 1 FROM bins b
        WHERE ST_DWithin(h.location::geography, b.location::geography, $1)
      )
      RETURNING id, reason, ST_AsGeoJSON(location::geometry) AS location;
    `;

    const insertRes = await pool.query(qInsert, [dist]);
    res.status(201).json(insertRes.rows); // return array directly
  } catch (err) {
    console.error('suggestBins error', err);
    res.status(500).json({ error: 'Failed to generate suggested bins' });
  }
}

// GET all suggested bins
export async function getSuggestedBins(req, res) {
  try {
    const q = `
      SELECT id, reason, ST_AsGeoJSON(location::geometry) AS location
      FROM suggested_bins;
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    console.error('getSuggestedBins error', err);
    res.status(500).json({ error: 'Failed to fetch suggested bins' });
  }
}

// GET number of households served by a bin
export async function binCoverage(req, res) {
  try {
    const binId = Number(req.params.binId);
    const dist = Number(req.query.dist) || 300;

    const q = `
      SELECT b.id AS bin_id, COUNT(h.id) AS served_households
      FROM bins b
      LEFT JOIN households h
        ON ST_DWithin(h.location::geography, b.location::geography, $1)
      WHERE b.id = $2
      GROUP BY b.id;
    `;
    const result = await pool.query(q, [dist, binId]);
    res.json(result.rows[0] || { bin_id: binId, served_households: 0 });
  } catch (err) {
    console.error('binCoverage error', err);
    res.status(500).json({ error: 'Failed to compute bin coverage' });
  }
}

// GET average distance to nearest bin per ward
export async function avgDistancePerWard(req, res) {
  try {
    const q = `
      SELECT ward,
             AVG(min_dist) AS avg_distance_m
      FROM (
        SELECT h.id, h.ward,
               MIN(ST_Distance(h.location::geography, b.location::geography)) AS min_dist
        FROM households h
        CROSS JOIN bins b
        GROUP BY h.id, h.ward
      ) sub
      GROUP BY ward
      ORDER BY ward;
    `;
    const result = await pool.query(q);
    res.json(result.rows);
  } catch (err) {
    console.error('avgDistancePerWard error', err);
    res.status(500).json({ error: 'Failed to compute avgDistancePerWard' });
  }
}
