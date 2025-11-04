import { sql } from '../db.js';
import { NextApiResponse, NextApiRequest } from 'next';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const { id } = request.query;

  if (typeof id !== 'string') {
    return response.status(400).json({ error: 'Invalid ID' });
  }

  if (request.method === 'PUT') {
    try {
      const { name, category, quantity, sellingPrice } = request.body;
      await sql`
        UPDATE products
        SET name = ${name}, category = ${category}, quantity = ${quantity}, sellingPrice = ${sellingPrice}
        WHERE id = ${id};
      `;
      return response.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
      return response.status(500).json({ error: (error as Error).message });
    }
  } else if (request.method === 'DELETE') {
    try {
      await sql`DELETE FROM products WHERE id = ${id};`;
      return response.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      return response.status(500).json({ error: (error as Error).message });
    }
  } else {
    response.setHeader('Allow', ['PUT', 'DELETE']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}