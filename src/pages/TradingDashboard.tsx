import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { SetupPanel } from '../components/SetupPanel';
import { ResultsTable } from '../components/ResultsTable';
import { useLanguage } from '../contexts/LanguageContext';
import type { TradingSetup, StockResult, TimeInterval, StockDetail } from '../types';
import { getStockData } from "../services/yfinance";

// Função auxiliar para verificar se uma data é dia útil
function isBusinessDay(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6; // 0 = Domingo, 6 = Sábado
}

// Função auxiliar para contar dias úteis entre duas datas
function countBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (isBusinessDay(currentDate)) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count;
}

// Função auxiliar para processar trade diário
function processDayTrade(
  date: Date,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number,
  setup: TradingSetup,
  previousDayCapital: number,
  tradeExecutionText: string
): StockDetail | null {
  const suggestedEntryPrice = setup.operation === 'BUY'
    ? open * (1 - setup.entryPercentage / 100)
    : open * (1 + setup.entryPercentage / 100);

  const trade = setup.operation === 'BUY'
    ? (low <= suggestedEntryPrice ? tradeExecutionText : null)
    : (high >= suggestedEntryPrice ? tradeExecutionText : null);

  const lotSize = trade ? Math.floor(previousDayCapital / suggestedEntryPrice) : 0;

  const stopValue = trade ? (
    setup.operation === 'BUY'
      ? suggestedEntryPrice * (1 - setup.stopPercentage / 100)
      : suggestedEntryPrice * (1 + setup.stopPercentage / 100)
  ) : 0;

  const stopHit = trade && (
    setup.operation === 'BUY'
      ? low <= stopValue
      : high >= stopValue
  );

  let profitLoss = 0;
  if (trade) {
    const exitPrice = stopHit ? stopValue : close;
    profitLoss = setup.operation === 'BUY'
      ? (exitPrice - suggestedEntryPrice) * lotSize
      : (suggestedEntryPrice - exitPrice) * lotSize;
  }

  const currentCapital = previousDayCapital + profitLoss;

  return {
    date: date.toISOString(),
    open,
    close,
    high,
    low,
    volume,
    suggestedEntryPrice,
    realPrice: trade ? suggestedEntryPrice : 0,
    trade,
    lotSize,
    stopValue,
    stopHit,
    profitLoss,
    currentCapital,
  };
}

// Função auxiliar para processar trade por período
function processPeriodTrade(
  startDate: Date,
  endDate: Date,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number,
  setup: TradingSetup,
  previousDayCapital: number,
  tradeExecutionText: string
): StockDetail | null {
  return processDayTrade(
    startDate,
    open,
    high,
    low,
    close,
    volume,
    setup,
    previousDayCapital,
    tradeExecutionText
  );
}

export function TradingDashboard() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval | 'HOME'>(
    (location.state?.interval as TimeInterval | 'HOME') || 'HOME'
  );
  const [results, setResults] = useState<StockResult[] | null>(null);
  const [currentSetup, setCurrentSetup] = useState<TradingSetup | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.setup) {
      setCurrentSetup(location.state.setup);
      if (location.state.interval) {
        setSelectedInterval(location.state.interval);
      }
    }
  }, [location.state]);

  const handleIntervalChange = (interval: TimeInterval | 'HOME') => {
    setSelectedInterval(interval);
    if (interval === 'HOME') {
      setResults(null);
      setCurrentSetup(null);
      setError(null);
    }
  };

  const handleSetupSubmit = (setup: TradingSetup) => {
    if (selectedInterval === 'HOME') {
      setError('Please select an interval before showing results.');
      return;
    }
    setError(null);
    calculateResults(setup);
  };

  const calculateResults = async (setup: TradingSetup) => {
    setLoading(true);
    setError(null);
    const getTradeExecutionText = () => language === 'pt' ? 'EXECUTADO' : 'EXECUTED';
    const now = new Date();
    let startDate: Date;
    let endDate = now;

    // Define o período baseado no setup.period
    switch (setup.period) {
      case '1M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case '2M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());
        break;
      case '3M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1Y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'CUSTOM':
        startDate = setup.customStartDate || new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }

    try {
      const results: StockResult[] = [];
      const failedStocks: string[] = [];

      // Calcula os dias úteis baseado no período selecionado
      const periodTradingDays = countBusinessDays(startDate, endDate);

      for (const symbol of setup.stocks) {
        try {
          const stockData = await getStockData(symbol, startDate, endDate);
          
          if (!stockData?.chart?.result?.[0]?.indicators?.quote?.[0]) {
            failedStocks.push(symbol);
            continue;
          }

          const quote = stockData.chart.result[0].indicators.quote[0];
          const timestamps = stockData.chart.result[0].timestamp;
          
          if (!quote.open || !quote.high || !quote.low || !quote.close || !quote.volume) {
            failedStocks.push(symbol);
            continue;
          }

          const details: StockDetail[] = [];
          let previousDayCapital = setup.initialCapital;

          // Processamento específico para cada intervalo de trading
          if (selectedInterval === 'DAYTRADE') {
            // Para daytrade, processa cada dia individualmente
            for (let i = 0; i < timestamps.length; i++) {
              const date = new Date(timestamps[i] * 1000);
              if (!isBusinessDay(date)) continue;

              const dayTrade = processDayTrade(
                date,
                quote.open[i],
                quote.high[i],
                quote.low[i],
                quote.close[i],
                quote.volume[i],
                setup,
                previousDayCapital,
                getTradeExecutionText()
              );

              if (dayTrade) {
                details.push(dayTrade);
                previousDayCapital = dayTrade.currentCapital;
              }
            }
          } else {
            // Para outros intervalos, processa o período completo
            let periodStartIndex = -1;
            let periodEndIndex = -1;

            // Encontra os índices do primeiro e último dia do período
            for (let i = 0; i < timestamps.length; i++) {
              const date = new Date(timestamps[i] * 1000);
              if (!isBusinessDay(date)) continue;

              if (periodStartIndex === -1) {
                periodStartIndex = i;
              }
              periodEndIndex = i;
            }

            if (periodStartIndex !== -1 && periodEndIndex !== -1) {
              const periodTrade = processPeriodTrade(
                new Date(timestamps[periodStartIndex] * 1000),
                new Date(timestamps[periodEndIndex] * 1000),
                quote.open[periodStartIndex],
                quote.high[periodEndIndex],
                quote.low[periodEndIndex],
                quote.close[periodEndIndex],
                quote.volume[periodEndIndex],
                setup,
                previousDayCapital,
                getTradeExecutionText()
              );

              if (periodTrade) {
                details.push(periodTrade);
                previousDayCapital = periodTrade.currentCapital;
              }
            }
          }

          if (details.length === 0) {
            failedStocks.push(symbol);
            continue;
          }

          const executedTrades = details.filter(d => d.trade).length;
          const tradePercentage = (executedTrades / periodTradingDays) * 100;
          
          const profitTrades = details.filter(d => d.profitLoss > 0);
          const numProfits = profitTrades.length;
          const profitPercentage = executedTrades > 0 ? (numProfits / executedTrades) * 100 : 0;
          
          const lossTrades = details.filter(d => d.profitLoss < 0);
          const numLosses = lossTrades.length;
          const lossPercentage = executedTrades > 0 ? (numLosses / executedTrades) * 100 : 0;
          
          const stopTrades = details.filter(d => d.stopHit);
          const numStops = stopTrades.length;
          const stopPercentage = executedTrades > 0 ? (numStops / executedTrades) * 100 : 0;
          
          const finalCapital = details[details.length - 1].currentCapital;

          results.push({
            symbol,
            tradingDays: periodTradingDays, // Usa os dias úteis do período selecionado
            numTrades: executedTrades,
            tradePercentage,
            numProfits,
            profitPercentage,
            numLosses,
            lossPercentage,
            numStops,
            stopPercentage,
            finalCapital,
          });
        } catch (error: any) {
          console.warn(`Error processing ${symbol}:`, error);
          failedStocks.push(symbol);
        }
      }

      if (results.length === 0) {
        throw new Error('No data could be retrieved for any of the selected stocks');
      }

      if (failedStocks.length > 0) {
        setError(`Warning: Could not process data for: ${failedStocks.join(', ')}`);
      }

      setResults(results);
      setCurrentSetup(setup);
    } catch (error: any) {
      console.error('Error calculating results:', error);
      setError(error.message || 'An error occurred while calculating results');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (symbol: string) => {
    if (!currentSetup) return;
    navigate(`/analysis/${symbol}`, { 
      state: { 
        setup: currentSetup,
        interval: selectedInterval 
      }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar
        selectedInterval={selectedInterval}
        onIntervalChange={handleIntervalChange}
        onExpandChange={setIsSidebarExpanded}
      />
      <main 
        className="flex-1 p-8 transition-all duration-300"
        style={{ marginLeft: isSidebarExpanded ? '16rem' : '5rem' }}
      >
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className={`mb-4 p-4 rounded-lg ${
              error.startsWith('Warning:') 
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}
          
          <SetupPanel 
            onSubmit={handleSetupSubmit}
            initialSetup={currentSetup}
          />
          {loading ? (
            <div className="mt-8 flex justify-center">
              <div className="loading-spinner" />
            </div>
          ) : results && (
            <ResultsTable 
              results={results} 
              onViewDetails={handleViewDetails}
            />
          )}
        </div>
      </main>
    </div>
  );
}