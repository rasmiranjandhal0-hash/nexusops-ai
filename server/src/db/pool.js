import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

// Automatically configure SSL for Supabase, Neon, Railway, Render, etc.
const isCloudPostgres = connectionString && (
  connectionString.includes('supabase.co') ||
  connectionString.includes('neon.tech') ||
  connectionString.includes('railway.app') ||
  connectionString.includes('render.com') ||
  process.env.NODE_ENV === 'production'
);

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        ssl: isCloudPostgres ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        database: process.env.PGDATABASE || 'postgres',
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || 'postgres',
      }
);

let isConnected = false;

export async function testConnection() {
  try {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as current_time, current_database() as db_name');
    client.release();
    isConnected = true;
    return {
      connected: true,
      time: res.rows[0].current_time,
      database: res.rows[0].db_name,
    };
  } catch (err) {
    isConnected = false;
    return {
      connected: false,
      error: err.message,
    };
  }
}

export function getDbConnectionStatus() {
  return isConnected;
}

export default pool;
