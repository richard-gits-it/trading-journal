import pkg from 'pg';
const { Pool } = pkg;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const client = await pool.connect();
    
    // Create trades table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        date VARCHAR(10) NOT NULL,
        time VARCHAR(10) NOT NULL,
        symbol VARCHAR(10) NOT NULL,
        side VARCHAR(4) NOT NULL,
        quantity INTEGER NOT NULL,
        entry_price DECIMAL(10, 2),
        exit_price DECIMAL(10, 2),
        status VARCHAR(10),
        pnl DECIMAL(10, 2),
        pnl_percent DECIMAL(10, 2),
        rr_ratio DECIMAL(10, 2),
        tags JSONB,
        notes TEXT,
        confidence INTEGER,
        setup VARCHAR(100),
        target DECIMAL(10, 2),
        stop_loss DECIMAL(10, 2),
        screenshots JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    client.release();
    await pool.end();

    return res.status(200).json({ 
      message: 'Database initialized successfully',
      success: true 
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    await pool.end();
    return res.status(500).json({ error: error.message });
  }
}
