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
  const { period1, period2 } = event.queryStringParameters || {};

  if (!symbol || !period1 || !period2) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Symbol and period parameters are required' })
    };
  }

  try {
    console.log(`Fetching historical data for ${symbol} from ${new Date(Number(period1) * 1000)} to ${new Date(Number(period2) * 1000)}`);
    
    const queryOptions = {
      period1: new Date(Number(period1) * 1000),
      period2: new Date(Number(period2) * 1000),
      interval: '1d'
    };

    const result = await yahooFinance.historical(symbol, queryOptions);

    if (!result || result.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: "No data found",
          symbol: symbol
        })
      };
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(transformedData)
    };
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: "Error fetching data from Yahoo Finance",
        details: error.message,
        symbol: symbol
      })
    };
  }
};