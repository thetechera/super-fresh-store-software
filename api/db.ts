import { createPool } from '@vercel/postgres';

// By passing the connectionString explicitly, we remove any ambiguity
// caused by multiple database environment variables in the Vercel project.
// This ensures the app connects to the intended database.
const pool = createPool({
    connectionString: process.env.POSTGRES_URL,
});

export const sql = pool.sql;
