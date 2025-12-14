# Trading Journal - Cloud Version

A professional trading journal with Vercel Postgres database integration. Access your trades from anywhere!

## Features

- ✅ **Cloud Database** - Vercel Postgres (free tier)
- ✅ **Global Access** - Access from any device
- ✅ **Calendar View** - Visual trading calendar
- ✅ **Analytics** - Win rate, P&L tracking, performance charts
- ✅ **Import/Export** - JSON backup and restore
- ✅ **Mobile Friendly** - Responsive design
- ✅ **Free Hosting** - Vercel free tier

## Quick Start

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete setup instructions.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: Vercel Postgres
- **Hosting**: Vercel

## Project Structure

```
trading-journal-vercel/
├── api/                    # Serverless API endpoints
│   ├── trades.js          # CRUD operations
│   └── init-db.js         # Database initialization
├── src/                   # React application
│   ├── App.jsx           # Main component
│   ├── main.jsx          # Entry point
│   └── index.css         # Styles
├── public/               # Static assets
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
└── vercel.json           # Vercel configuration
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Database Schema

```sql
CREATE TABLE trades (
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
);
```

## License

MIT
