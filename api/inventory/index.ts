import { sql } from '../db.js';
import { NextApiResponse, NextApiRequest } from 'next';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    const { rows } = await sql`
      SELECT
        p.id,
        p.name,
        p.category,
        p.quantity AS "initialQuantity",
        COALESCE(purchases_sum.total_purchased, 0) AS "quantityPurchase",
        COALESCE(sales_sum.total_sold, 0) AS "quantitySale",
        (p.quantity + COALESCE(purchases_sum.total_purchased, 0) - COALESCE(sales_sum.total_sold, 0)) AS stocks
      FROM
        products p
      LEFT JOIN
        (SELECT productId, SUM(quantity) as total_purchased FROM purchases GROUP BY productId) AS purchases_sum
        ON p.id = purchases_sum.productId
      LEFT JOIN
        (SELECT productId, SUM(quantity) as total_sold FROM sales GROUP BY productId) AS sales_sum
        ON p.id = sales_sum.productId;
    `;
    
    // Add reorder status logic
    const inventoryWithStatus = rows.map(item => ({
        ...item,
        reorderLevel: 20, // Default reorder level
        reorderStatus: item.stocks <= 20 ? 'Low Stock' : 'In Stock'
    }));

    return response.status(200).json(inventoryWithStatus);
  } catch (error) {
    return response.status(500).json({ error: (error as Error).message });
  }
}