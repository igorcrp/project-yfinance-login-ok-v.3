import { Handler } from '@netlify/functions';
import yahooFinance from 'yahoo-finance2';

export const handler: Handler = async (event) => {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  if (!event.path) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Path is required' })
    };
  }

  // Extract symbol from path
  const symbol = event.path.split('/').pop();

  if (!symbol) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Symbol is required' })
    };
  }

  try {
    console.log(`Fetching quote for ${symbol}`);
    
    const quote = await yahooFinance.quote(symbol);

    if (!quote) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: "No quote found",
          symbol: symbol
        })
      };
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error fetching quote:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Error fetching quote from Yahoo Finance",
        details: error.message,
        symbol: symbol
      })
    };
  }
};