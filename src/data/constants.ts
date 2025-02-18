// src/data/constants.ts
export const INDICES = [
  { id: 'IBOV', name: 'Ibovespa', country: 'BR' },
  { id: 'SP500', name: 'S&P 500', country: 'US' }
] as const;

export const STOCKS = [
  // Brazilian Stocks
  { symbol: 'PETR4.SA', name: 'Petrobras PN', index: 'IBOV' },
  { symbol: 'VALE3.SA', name: 'Vale ON', index: 'IBOV' },
  { symbol: 'ITUB4.SA', name: 'Itaú Unibanco PN', index: 'IBOV' },
  { symbol: 'BBDC4.SA', name: 'Bradesco PN', index: 'IBOV' },
  { symbol: 'B3SA3.SA', name: 'B3 ON', index: 'IBOV' },
  { symbol: 'ABEV3.SA', name: 'Ambev ON', index: 'IBOV' },
  { symbol: 'WEGE3.SA', name: 'WEG ON', index: 'IBOV' },
  { symbol: 'RENT3.SA', name: 'Localiza ON', index: 'IBOV' },
  { symbol: 'BBAS3.SA', name: 'Banco do Brasil ON', index: 'IBOV' },
  { symbol: 'SUZB3.SA', name: 'Suzano ON', index: 'IBOV' },
   
  // US Stocks
  { symbol: 'AAPL', name: 'Apple Inc', index: 'SP500' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', index: 'SP500' },
  { symbol: 'GOOGL', name: 'Alphabet Inc', index: 'SP500' },
  { symbol: 'AMZN', name: 'Amazon.com Inc', index: 'SP500' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', index: 'SP500' },
  { symbol: 'META', name: 'Meta Platforms Inc', index: 'SP500' },
  { symbol: 'TSLA', name: 'Tesla Inc', index: 'SP500' },
  { symbol: 'BRK-B', name: 'Berkshire Hathaway Inc', index: 'SP500' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co', index: 'SP500' },
  { symbol: 'V', name: 'Visa Inc', index: 'SP500' }
] as const;