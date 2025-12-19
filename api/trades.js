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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-trading-mode');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Get user ID and trading mode from headers
  const userId = req.headers['x-user-id'];
  const tradingMode = req.headers['x-trading-mode'] || 'live';
  
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized - User ID required' });
    return;
  }

  let client;
  try {
    client = await pool.connect();

    if (req.method === 'GET') {
      // Get all trades for this user in the specified mode
      const result = await client.query(
        'SELECT * FROM trades WHERE user_id = $1 AND mode = $2 ORDER BY date DESC, time DESC',
        [userId, tradingMode]
      );
      res.status(200).json({ trades: result.rows });

    } else if (req.method === 'POST') {
      // Create new trade for this user in the specified mode
      const { date, time, exitDate, exitTime, symbol, side, quantity, entryPrice, exitPrice, status, pnl, pnlPercent, rrRatio, tags, notes, confidence, setup, target, stopLoss, screenshots, market } = req.body;
      
      const result = await client.query(
        `INSERT INTO trades (user_id, mode, date, time, exit_date, exit_time, symbol, side, quantity, entry_price, exit_price, status, pnl, pnl_percent, rr_ratio, tags, notes, confidence, setup, target, stop_loss, screenshots, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW())
         RETURNING *`,
        [userId, tradingMode, date, time, exitDate || null, exitTime || null, symbol, side, quantity, entryPrice, exitPrice, status, pnl, pnlPercent, rrRatio, JSON.stringify(tags || []), notes, confidence, setup, target, stopLoss, JSON.stringify(screenshots || [])]
      );
      
      res.status(201).json({ trade: result.rows[0] });

    } else if (req.method === 'PUT') {
      // Update trade (only if it belongs to this user and is in the same mode)
      const { id, date, time, exitDate, exitTime, symbol, side, quantity, entryPrice, exitPrice, status, pnl, pnlPercent, rrRatio, tags, notes, confidence, setup, target, stopLoss, screenshots, market } = req.body;
      
      const result = await client.query(
        `UPDATE trades 
         SET date = $1, time = $2, exit_date = $3, exit_time = $4, symbol = $5, side = $6, quantity = $7, 
             entry_price = $8, exit_price = $9, status = $10, pnl = $11, pnl_percent = $12, rr_ratio = $13, 
             tags = $14, notes = $15, confidence = $16, setup = $17, target = $18, stop_loss = $19, screenshots = $20
         WHERE id = $21 AND user_id = $22 AND mode = $23
         RETURNING *`,
        [date, time, exitDate || null, exitTime || null, symbol, side, quantity, entryPrice, exitPrice, status, pnl, pnlPercent, rrRatio, JSON.stringify(tags || []), notes, confidence, setup, target, stopLoss, JSON.stringify(screenshots || []), id, userId, tradingMode]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Trade not found or unauthorized' });
      } else {
        res.status(200).json({ trade: result.rows[0] });
      }

    } else if (req.method === 'DELETE') {
      // Delete trade (only if it belongs to this user and is in the same mode)
      const { id } = req.query;
      
      const result = await client.query(
        'DELETE FROM trades WHERE id = $1 AND user_id = $2 AND mode = $3 RETURNING *',
        [id, userId, tradingMode]
      );
      
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Trade not found or unauthorized' });
      } else {
        res.status(200).json({ message: 'Trade deleted successfully' });
      }

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database operation failed', details: error.message });
  } finally {
    if (client) {
      client.release();
    }
  }
}
