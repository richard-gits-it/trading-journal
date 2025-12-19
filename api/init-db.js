import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  let client;
  try {
    client = await pool.connect();
    
    // Check if user_id column exists
    const checkUserIdColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='trades' AND column_name='user_id'
    `);

    if (checkUserIdColumn.rows.length === 0) {
      // Add user_id column if it doesn't exist
      await client.query(`
        ALTER TABLE trades ADD COLUMN user_id VARCHAR(255)
      `);
      console.log('Added user_id column');
    }

    // Check if exit_date column exists
    const checkExitDateColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='trades' AND column_name='exit_date'
    `);

    if (checkExitDateColumn.rows.length === 0) {
      // Add exit_date column if it doesn't exist
      await client.query(`
        ALTER TABLE trades ADD COLUMN exit_date VARCHAR(10)
      `);
      console.log('Added exit_date column');
    }

    // Check if exit_time column exists
    const checkExitTimeColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='trades' AND column_name='exit_time'
    `);

    if (checkExitTimeColumn.rows.length === 0) {
      // Add exit_time column if it doesn't exist
      await client.query(`
        ALTER TABLE trades ADD COLUMN exit_time VARCHAR(10)
      `);
      console.log('Added exit_time column');
    }

    // Create trades table with all columns
    await client.query(`
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255),
        date VARCHAR(10),
        time VARCHAR(10),
        exit_date VARCHAR(10),
        exit_time VARCHAR(10),
        symbol VARCHAR(10),
        side VARCHAR(4),
        quantity INTEGER,
        entry_price DECIMAL(10,2),
        exit_price DECIMAL(10,2),
        status VARCHAR(10),
        pnl DECIMAL(10,2),
        pnl_percent DECIMAL(10,2),
        rr_ratio DECIMAL(10,2),
        tags JSONB,
        notes TEXT,
        confidence INTEGER,
        setup VARCHAR(100),
        target DECIMAL(10,2),
        stop_loss DECIMAL(10,2),
        screenshots JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(date DESC)
    `);

    res.status(200).json({ 
      message: 'Database initialized successfully with exit date/time tracking',
      updates: {
        userIdColumn: checkUserIdColumn.rows.length > 0 ? 'Already exists' : 'Just added',
        exitDateColumn: checkExitDateColumn.rows.length > 0 ? 'Already exists' : 'Just added',
        exitTimeColumn: checkExitTimeColumn.rows.length > 0 ? 'Already exists' : 'Just added'
      }
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ 
      error: 'Database initialization failed', 
      details: error.message 
    });
  } finally {
    if (client) {
      client.release();
    }
  }
}
