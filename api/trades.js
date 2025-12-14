import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get all trades
      const { rows } = await sql`
        SELECT * FROM trades ORDER BY date DESC, time DESC
      `;
      return res.status(200).json({ trades: rows });
    }

    if (req.method === 'POST') {
      // Create new trade
      const trade = req.body;
      
      const { rows } = await sql`
        INSERT INTO trades (
          date, time, symbol, side, quantity, entry_price, exit_price,
          status, pnl, pnl_percent, rr_ratio, tags, notes, confidence,
          setup, target, stop_loss, screenshots
        ) VALUES (
          ${trade.date}, ${trade.time}, ${trade.symbol}, ${trade.side},
          ${trade.quantity}, ${trade.entryPrice}, ${trade.exitPrice},
          ${trade.status}, ${trade.pnl}, ${trade.pnlPercent}, ${trade.rrRatio},
          ${JSON.stringify(trade.tags)}, ${trade.notes}, ${trade.confidence},
          ${trade.setup}, ${trade.target}, ${trade.stopLoss},
          ${JSON.stringify(trade.screenshots)}
        )
        RETURNING *
      `;
      
      return res.status(201).json({ trade: rows[0] });
    }

    if (req.method === 'PUT') {
      // Update existing trade
      const trade = req.body;
      
      const { rows } = await sql`
        UPDATE trades SET
          date = ${trade.date},
          time = ${trade.time},
          symbol = ${trade.symbol},
          side = ${trade.side},
          quantity = ${trade.quantity},
          entry_price = ${trade.entryPrice},
          exit_price = ${trade.exitPrice},
          status = ${trade.status},
          pnl = ${trade.pnl},
          pnl_percent = ${trade.pnlPercent},
          rr_ratio = ${trade.rrRatio},
          tags = ${JSON.stringify(trade.tags)},
          notes = ${trade.notes},
          confidence = ${trade.confidence},
          setup = ${trade.setup},
          target = ${trade.target},
          stop_loss = ${trade.stopLoss},
          screenshots = ${JSON.stringify(trade.screenshots)}
        WHERE id = ${trade.id}
        RETURNING *
      `;
      
      return res.status(200).json({ trade: rows[0] });
    }

    if (req.method === 'DELETE') {
      // Delete trade
      const { id } = req.query;
      
      await sql`DELETE FROM trades WHERE id = ${id}`;
      
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
