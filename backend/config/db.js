// backend/config/db.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'waste_bin_db',
  password: process.env.PGPASSWORD || 'aadhi',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres client error', err);
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostGIS:', res.rows[0].now);
  } catch (err) {
    console.error('❌ PostGIS connection error:', err);
  }
}

testConnection();

export default pool;
