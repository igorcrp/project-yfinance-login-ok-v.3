import express from 'express';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Configure CORS with proper options
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../../dist')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

app.get("/api/historical/:symbol", async (req, res) => {
  const { symbol } = req.params;
  const { period1, period2 } = req.query;

  if (!symbol || !period1 || !period2) {
    return res.status(400).json({
      error: "Missing required parameters",
      details: "symbol, period1, and period2 are required"
    });
  }

  try {
    console.log(`Fetching historical data for ${symbol}`);
    console.log(`Period: ${new Date(Number(period1) * 1000)} to ${new Date(Number(period2) * 1000)}`);

    const queryOptions = {
      period1: new Date(Number(period1) * 1000),
      period2: new Date(Number(period2) * 1000),
      interval: '1d'
    };

    const result = await yahooFinance.historical(symbol, queryOptions);

    if (!result || result.length === 0) {
      console.log(`No data found for ${symbol}`);
      return res.status(404).json({
        error: "No data found",
        symbol: symbol
      });
    }

    const transformedData = {
      chart: {
        result: [{
          timestamp: result.map(item => Math.floor(new Date(item.date).getTime() / 1000)),
          indicators: {
            quote: [{
              open: result.map(item => item.open),
              high: result.map(item => item.high),
              low: result.map(item => item.low),
              close: result.map(item => item.close),
              volume: result.map(item => item.volume)
            }]
          }
        }]
      }
    };

    console.log(`Successfully fetched data for ${symbol}`);
    res.json(transformedData);
  } catch (error) {
    console.error('Yahoo Finance API Error:', error);
    res.status(500).json({ 
      error: "Error fetching data from Yahoo Finance",
      details: error.message,
      symbol: symbol
    });
  }
});

app.get("/api/quote/:symbol", async (req, res) => {
  const { symbol } = req.params;

  if (!symbol) {
    return res.status(400).json({
      error: "Missing symbol parameter"
    });
  }

  try {
    console.log(`Fetching quote for ${symbol}`);
    const quote = await yahooFinance.quote(symbol);

    if (!quote) {
      console.log(`No quote found for ${symbol}`);
      return res.status(404).json({
        error: "No quote found",
        symbol: symbol
      });
    }

    const response = {
      symbol: quote.symbol,
      regularMarketPrice: quote.regularMarketPrice || 0,
      regularMarketOpen: quote.regularMarketOpen || 0,
      regularMarketDayHigh: quote.regularMarketDayHigh || 0,
      regularMarketDayLow: quote.regularMarketDayLow || 0,
      regularMarketVolume: quote.regularMarketVolume || 0,
      regularMarketPreviousClose: quote.regularMarketPreviousClose || 0
    };

    console.log(`Successfully fetched quote for ${symbol}`);
    res.json(response);
  } catch (error) {
    console.error('Yahoo Finance API Error:', error);
    res.status(500).json({ 
      error: "Error fetching quote from Yahoo Finance",
      details: error.message,
      symbol: symbol
    });
  }
});

// Serve index.html for all other routes to support client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

let server;

function startServer() {
  server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   Proxy Server Running on Port ${PORT}        ║
║                                            ║
║   Ready to handle stock data requests      ║
║                                            ║
╚════════════════════════════════════════════╝
    `);
  });

  // Handle server errors
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   Port ${PORT} is already in use!             ║
║   Please try a different port or stop      ║
║   the existing process.                    ║
║                                            ║
╚════════════════════════════════════════════╝
      `);
      process.exit(1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  // Proper cleanup on server shutdown
  server.on('close', () => {
    console.log('Server is shutting down...');
  });
}

// Graceful shutdown handling
function shutdown() {
  console.log('Received shutdown signal');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

    // Force close if graceful shutdown fails
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
}

// Handle process signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  shutdown();
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown();
});

// Start the server
startServer();