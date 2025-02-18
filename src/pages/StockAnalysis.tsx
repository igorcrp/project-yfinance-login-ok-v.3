import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { StockDetails } from '../components/StockDetails';
import { getStockData } from '../services/yfinance';
import { useLanguage } from '../contexts/LanguageContext';
import type { TradingSetup, StockDetail } from '../types';

export function StockAnalysis() {
  const { language } = useLanguage();
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [setup, setSetup] = useState<TradingSetup | null>(location.state?.setup || null);
  const [details, setDetails] = useState<StockDetail[] | null>(null);
  const [loading, setLoading] = useState(true);

  const getTradeExecutionText = () => language === 'pt' ? 'EXECUTADO' : 'EXECUTED';

  useEffect(() => {
    const fetchData = async () => {
      if (!symbol || !setup) return;

      try {
        const now = new Date();
        let startDate: Date;
        let endDate = now;

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

        const stockData = await getStockData(symbol, startDate, endDate);

        if (!stockData?.chart?.result?.[0]) {
          throw new Error('No data available');
        }

        const stockDetails: StockDetail[] = [];
        let previousDayCapital = setup.initialCapital;

        stockData.chart.result[0].timestamp.forEach((timestamp: number, index: number) => {
          const quote = stockData.chart.result[0].indicators.quote[0];
          const date = new Date(timestamp * 1000);
          
          let previousDayReference: number;
          if (index === 0) {
            previousDayReference = quote.open[index];
          } else {
            switch (setup.referencePrice) {
              case 'OPEN':
                previousDayReference = quote.open[index - 1];
                break;
              case 'HIGH':
                previousDayReference = quote.high[index - 1];
                break;
              case 'LOW':
                previousDayReference = quote.low[index - 1];
                break;
              case 'PREV_CLOSE':
                previousDayReference = quote.close[index - 1];
                break;
              default:
                previousDayReference = quote.open[index - 1];
            }
          }

          const suggestedEntryPrice = setup.operation === 'BUY'
            ? previousDayReference - (previousDayReference * setup.entryPercentage / 100)
            : previousDayReference + (previousDayReference * setup.entryPercentage / 100);

          const trade = setup.operation === 'BUY'
            ? (quote.low[index] <= suggestedEntryPrice ? getTradeExecutionText() : null)
            : (quote.high[index] >= suggestedEntryPrice ? getTradeExecutionText() : null);

          const lotSize = trade === getTradeExecutionText() ? Math.floor(previousDayCapital / suggestedEntryPrice) : 0;

          const stopValue = trade === getTradeExecutionText() ? (
            setup.operation === 'BUY'
              ? suggestedEntryPrice - (suggestedEntryPrice * setup.stopPercentage / 100)
              : suggestedEntryPrice + (suggestedEntryPrice * setup.stopPercentage / 100)
          ) : 0;

          const stopHit = trade === getTradeExecutionText() && (
            setup.operation === 'BUY'
              ? quote.low[index] <= stopValue
              : quote.high[index] >= stopValue
          );

          let profitLoss = 0;
          if (trade === getTradeExecutionText()) {
            if (stopHit) {
              profitLoss = (stopValue - suggestedEntryPrice) * lotSize;
            } else {
              profitLoss = (quote.close[index] - suggestedEntryPrice) * lotSize;
            }
          }

          const currentCapital = previousDayCapital + profitLoss;

          stockDetails.push({
            date: date.toISOString(),
            open: quote.open[index],
            close: quote.close[index],
            high: quote.high[index],
            low: quote.low[index],
            volume: quote.volume[index],
            suggestedEntryPrice,
            realPrice: trade === getTradeExecutionText() ? suggestedEntryPrice : 0,
            trade,
            lotSize,
            stopValue,
            stopHit,
            profitLoss,
            currentCapital,
          });

          previousDayCapital = currentCapital;
        });

        stockDetails.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setDetails(stockDetails);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        alert('Error fetching stock data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, setup, language]);

  const handleUpdateResults = async (updatedSetup: Partial<TradingSetup>) => {
    if (!setup || !symbol) return;

    const newSetup = { ...setup, ...updatedSetup };
    setSetup(newSetup);
  };

  if (loading || !setup || !details || !symbol) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <StockDetails
      symbol={symbol}
      details={details}
      setup={setup}
      onUpdateResults={handleUpdateResults}
      onBack={() => navigate('/', { 
        state: { 
          setup,
          interval: location.state?.interval 
        }
      })}
    />
  );
}