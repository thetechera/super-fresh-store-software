import { createPool } from '@vercel/postgres';

// By default, the createPool function will use the Vercel-provided
// environment variables. This is the most robust way to connect.
// https://vercel.com/docs/storage/vercel-postgres/sdk#createpool
const pool = createPool();

export const sql = pool.sql;
