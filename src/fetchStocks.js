// src/fetchStocks.js
import { STOCKS } from './data/constants.js';
import { getQuote, getStockData } from './services/yfinance.js';

// Função para buscar e exibir a cotação atual de todas as ações listadas
async function fetchAllQuotes() {
  for (const stock of STOCKS) {
    try {
      console.log(`Buscando dados para: ${stock.name} (${stock.symbol})`);
      const quote = await getQuote(stock.symbol);
      console.log(`Cotação atual de ${stock.symbol}:`, quote);
    } catch (error) {
      console.error(`Erro ao buscar dados para ${stock.symbol}`);
    }
  }
}

// Chamada da função para buscar as cotações de todas as ações
fetchAllQuotes();
