import { sql } from '../db.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM products;`;
      return response.status(200).json(rows);
    } catch (error) {
      return response.status(500).json({ error: (error as Error).message });
    }
  } else if (request.method === 'POST') {
    try {
      const { id, name, category, quantity, sellingPrice } = request.body;
      await sql`
        INSERT INTO products (id, name, category, quantity, sellingPrice)
        VALUES (${id}, ${name}, ${category}, ${quantity}, ${sellingPrice});
      `;
      return response.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
      return response.status(500).json({ error: (error as Error).message });
    }
  } else {
    response.setHeader('Allow', ['GET', 'POST']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}
