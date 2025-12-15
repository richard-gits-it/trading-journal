import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get user ID from Clerk session
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized - User ID required' });
    return;
  }

  let client;
  try {
    client = await pool.connect();

    if (req.method === 'GET') {
      // Get all trades for this user only
      const result = await client.query(
        'SELECT * FROM trades WHERE user_id = $1 ORDER BY date DESC, time DESC',
        [userId]
      );
      res.status(200).json({ trades: result.rows });

    } else if (req.method === 'POST') {
      // Create new trade for this user
      const { date, time, symbol, side, quantity, entryPrice, exitPrice, status, pnl, pnlPercent, rrRatio, tags, notes, confidence, setup, target, stopLoss, screenshots } = req.body;
      
      const result = await client.query(
        `INSERT INTO trades (user_id, date, time, symbol, side, quantity, entry_price, exit_price, status, pnl, pnl_percent, rr_ratio, tags, notes, confidence, setup, target, stop_loss, screenshots, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW())
         RETURNING *`,
        [userId, date, time, symbol, side, quantity, entryPrice, exitPrice, status, pnl, pnlPercent, rrRatio, JSON.stringify(tags || []), notes, confidence, setup, target, stopLoss, JSON.stringify(screenshots || [])]
      );
      
      res.status(201).json({ trade: result.rows[0] });

    } else if (req.method === 'PUT') {
      // Update trade (only if it belongs to this user)
      const { id, date, time, symbol, side, quantity, entryPrice, exitPrice, status, pnl, pnlPercent, rrRatio, tags, notes, confidence, setup, target, stopLoss, screenshots } = req.body;
      
      const result = await client.query(
        `UPDATE trades 
         SET date = $1, time = $2, symbol = $3, side = $4, quantity = $5, entry_price = $6, exit_price = $7, 
             status = $8, pnl = $9, pnl_percent = $10, rr_ratio = $11, tags = $12, notes = $13, 
             confidence = $14, setup = $15, target = $16, stop_loss = $17, screenshots = $18
         WHERE id = $19 AND user_id = $20
         RETURNING *`,
        [date, time, symbol, side, quantity, entryPrice, exitPrice, status, pnl, pnlPercent, rrRatio, JSON.stringify(tags || []), notes, confidence, setup, target, stopLoss, JSON.stringify(screenshots || []), id, userId]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Trade not found or unauthorized' });
      } else {
        res.status(200).json({ trade: result.rows[0] });
      }

    } else if (req.method === 'DELETE') {
      // Delete trade (only if it belongs to this user)
      const { id } = req.query;
      
      const result = await client.query(
        'DELETE FROM trades WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Trade not found or unauthorized' });
      } else {
        res.status(200).json({ deleted: true, id });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  } finally {
    if (client) client.release();
  }
}
