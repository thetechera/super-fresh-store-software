import { createPool } from '@vercel/postgres';
require('dotenv').config();

// By explicitly passing the connectionString from process.env.POSTGRES_URL,
// we instruct the application to connect to the specific external Neon database
// defined in the Vercel project's environment variables. This is the correct
// and necessary approach for non-Vercel databases.
const pool = createPool({
  console.log("-=-=-=-=-=-=-=",process.env.POSTGRES_URL);
  connectionString: process.env.POSTGRES_URL,
});

export const sql = pool.sql;
