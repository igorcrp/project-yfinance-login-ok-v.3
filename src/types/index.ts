export type Country = 'BR' | 'US' | 'ALL';
export type Operation = 'BUY' | 'SELL';
export type TimeInterval = 'DAYTRADE' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type ReferencePrice = 'OPEN' | 'HIGH' | 'LOW' | 'PREV_CLOSE';
export type Period = '1M' | '2M' | '3M' | '6M' | '1Y' | 'CUSTOM';

export interface Index {
  id: string;
  name: string;
  country: Country;
}

export interface Stock {
  symbol: string;
  name: string;
  index: string;
}

export interface TradingSetup {
  operation: Operation;
  country: Country;
  index: string;
  stocks: string[];
  referencePrice: ReferencePrice;
  period: Period;
  customStartDate?: Date;
  entryPercentage: number;
  stopPercentage: number;
  initialCapital: number;
}

export interface StockResult {
  symbol: string;
  tradingDays: number;
  numTrades: number;
  tradePercentage: number;
  numProfits: number;
  profitPercentage: number;
  numLosses: number;
  lossPercentage: number;
  numStops: number;
  stopPercentage: number;
  finalCapital: number;
}

export interface StockDetail {
  date: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  suggestedEntryPrice: number;
  realPrice: number;
  trade: string | null;
  lotSize: number;
  stopValue: number;
  stopHit: boolean;
  profitLoss: number;
  currentCapital: number;
}