import { sql } from '../db.js';
import { NextApiResponse, NextApiRequest } from 'next';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM sales ORDER BY date DESC;`;
      return response.status(200).json(rows);
    } catch (error) {
      return response.status(500).json({ error: (error as Error).message });
    }
  } else if (request.method === 'POST') {
    try {
      const { id, date, productId, productName, quantity, sellingPrice, totalPrice } = request.body;
      await sql`
        INSERT INTO sales (id, date, productId, productName, quantity, sellingPrice, totalPrice)
        VALUES (${id}, ${date}, ${productId}, ${productName}, ${quantity}, ${sellingPrice}, ${totalPrice});
      `;
      return response.status(201).json({ message: 'Sale added successfully' });
    } catch (error) {
      return response.status(500).json({ error: (error as Error).message });
    }
  } else {
    response.setHeader('Allow', ['GET', 'POST']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}