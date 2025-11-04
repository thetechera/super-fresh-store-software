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
      const { date, productId, productName, quantity, sellingPrice, totalPrice } = request.body;
      await sql`
        UPDATE sales
        SET date = ${date}, productId = ${productId}, productName = ${productName}, quantity = ${quantity}, sellingPrice = ${sellingPrice}, totalPrice = ${totalPrice}
        WHERE id = ${id};
      `;
      return response.status(200).json({ message: 'Sale updated successfully' });
    } catch (error) {
      return response.status(500).json({ error: (error as Error).message });
    }
  } else if (request.method === 'DELETE') {
    try {
      await sql`DELETE FROM sales WHERE id = ${id};`;
      return response.status(200).json({ message: 'Sale deleted successfully' });
    } catch (error) {
      return response.status(500).json({ error: (error as Error).message });
    }
  } else {
    response.setHeader('Allow', ['PUT', 'DELETE']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}