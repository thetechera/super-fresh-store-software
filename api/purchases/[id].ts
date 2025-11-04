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
      const { date, vendorName, productId, productName, quantity, costPrice, totalPurchasePrice } = request.body;
      await sql`
        UPDATE purchases
        SET date = ${date}, vendorName = ${vendorName}, productId = ${productId}, productName = ${productName}, quantity = ${quantity}, costPrice = ${costPrice}, totalPurchasePrice = ${totalPurchasePrice}
        WHERE id = ${id};
      `;
      return response.status(200).json({ message: 'Purchase updated successfully' });
    } catch (error) {
      return response.status(500).json({ error: (error as Error).message });
    }
  } else if (request.method === 'DELETE') {
    try {
      await sql`DELETE FROM purchases WHERE id = ${id};`;
      return response.status(200).json({ message: 'Purchase deleted successfully' });
    } catch (error) {
      return response.status(500).json({ error: (error as Error).message });
    }
  } else {
    response.setHeader('Allow', ['PUT', 'DELETE']);
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }
}