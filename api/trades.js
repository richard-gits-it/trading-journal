import pkg from 'pg';
const { Pool } = pkg;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();

    if (req.method === 'GET') {
      // Get all trades
      const result = await client.query(
        'SELECT * FROM trades ORDER BY date DESC, time DESC'
      );
      client.release();
      await pool.end();
      return res.status(200).json({ trades: result.rows });
    }

    if (req.method === 'POST') {
      // Create new trade
      const trade = req.body;
      
      const result = await client.query(
        `INSERT INTO trades (
          date, time, symbol, side, quantity, entry_price, exit_price,
          status, pnl, pnl_percent, rr_ratio, tags, notes, confidence,
          setup, target, stop_loss, screenshots
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *`,
        [
          trade.date, trade.time, trade.symbol, trade.side,
          trade.quantity, trade.entryPrice, trade.exitPrice,
          trade.status, trade.pnl, trade.pnlPercent, trade.rrRatio,
          JSON.stringify(trade.tags), trade.notes, trade.confidence,
          trade.setup, trade.target, trade.stopLoss,
          JSON.stringify(trade.screenshots)
        ]
      );
      
      client.release();
      await pool.end();
      return res.status(201).json({ trade: result.rows[0] });
    }

    if (req.method === 'PUT') {
      // Update existing trade
      const trade = req.body;
      
      const result = await client.query(
        `UPDATE trades SET
          date = $1, time = $2, symbol = $3, side = $4,
          quantity = $5, entry_price = $6, exit_price = $7,
          status = $8, pnl = $9, pnl_percent = $10, rr_ratio = $11,
          tags = $12, notes = $13, confidence = $14,
          setup = $15, target = $16, stop_loss = $17,
          screenshots = $18
        WHERE id = $19
        RETURNING *`,
        [
          trade.date, trade.time, trade.symbol, trade.side,
          trade.quantity, trade.entryPrice, trade.exitPrice,
          trade.status, trade.pnl, trade.pnlPercent, trade.rrRatio,
          JSON.stringify(trade.tags), trade.notes, trade.confidence,
          trade.setup, trade.target, trade.stopLoss,
          JSON.stringify(trade.screenshots), trade.id
        ]
      );
      
      client.release();
      await pool.end();
      return res.status(200).json({ trade: result.rows[0] });
    }

    if (req.method === 'DELETE') {
      // Delete trade
      const { id } = req.query;
      
      await client.query('DELETE FROM trades WHERE id = $1', [id]);
      
      client.release();
      await pool.end();
      return res.status(200).json({ success: true });
    }

    client.release();
    await pool.end();
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    await pool.end();
    return res.status(500).json({ error: error.message });
  }
}
