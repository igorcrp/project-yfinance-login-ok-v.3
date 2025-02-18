const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions'
  : 'http://localhost:3001/api';

/**
 * Busca dados históricos para um ativo.
 * @param {string} ticker - Símbolo da ação.
 * @param {Date} startDate - Data inicial.
 * @param {Date} endDate - Data final.
 * @returns Dados históricos do ativo.
 */
export async function getStockData(ticker: string, startDate: Date, endDate: Date) {
  try {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const response = await fetch(
      `${API_BASE_URL}/historical/${encodeURIComponent(ticker)}?` +
      `period1=${Math.floor(start.getTime() / 1000)}&` +
      `period2=${Math.floor(end.getTime() / 1000)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data?.chart?.result?.[0]) {
      throw new Error(`No data available for ${ticker}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching stock data:', error);
    throw new Error(`Failed to fetch data for ${ticker}: ${error.message}`);
  }
}

/**
 * Busca a cotação atual de um ativo.
 * @param {string} ticker - Símbolo da ação.
 * @returns Dados de cotação atual.
 */
export async function getQuote(ticker: string) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/quote/${encodeURIComponent(ticker)}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data) {
      throw new Error(`No quote data available for ${ticker}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error fetching quote:', error);
    throw new Error(`Failed to fetch quote for ${ticker}: ${error.message}`);
  }
}