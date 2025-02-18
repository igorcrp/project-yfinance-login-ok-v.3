import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { INDICES, STOCKS } from '../data/constants';
import { X, TrendingUp, Calendar, DollarSign, Percent, Building, BarChart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { TradingSetup, Country } from '../types';

interface SetupPanelProps {
  onSubmit: (setup: TradingSetup) => void;
  initialSetup?: TradingSetup | null;
}

export function SetupPanel({ onSubmit, initialSetup }: SetupPanelProps) {
  const location = useLocation();
  const setupFromNavigation = location.state?.setup;
  const { t } = useLanguage();

  const [setup, setSetup] = useState<TradingSetup>(() => {
    return setupFromNavigation || initialSetup || {
      operation: 'BUY',
      country: 'ALL',
      index: 'ALL',
      stocks: [],
      referencePrice: 'PREV_CLOSE',
      period: '',
      entryPercentage: 1,
      stopPercentage: 1,
      initialCapital: 10000,
    };
  });

  const [stockFilter, setStockFilter] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
  const [showEntryOptions, setShowEntryOptions] = useState(false);
  const [showStopOptions, setShowStopOptions] = useState(false);
  const [entryInputValue, setEntryInputValue] = useState(`${setup.entryPercentage}`);
  const [stopInputValue, setStopInputValue] = useState(`${setup.stopPercentage}`);
  const [showCustomDateInput, setShowCustomDateInput] = useState(false);
  const [customDateValue, setCustomDateValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handlePeriodChange = (value: string) => {
    setValidationError(null);
    if (value === 'CUSTOM') {
      setShowCustomDateInput(true);
      setCustomDateValue('');
    } else {
      setSetup(prev => ({
        ...prev,
        period: value as TradingSetup['period'],
        customStartDate: undefined
      }));
      setCustomDateValue('');
      setShowCustomDateInput(false);
    }
  };

  const handleCustomDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = customDateValue;
      
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = value.match(dateRegex);
      
      if (match) {
        const [_, day, month, year] = match;
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        
        const today = new Date();
        if (!isNaN(date.getTime()) && date <= today) {
          setSetup(prev => ({
            ...prev,
            period: 'CUSTOM',
            customStartDate: date
          }));
          setShowCustomDateInput(false);
          setValidationError(null);
        }
      }
    }
  };

  const handleCustomDateChange = (value: string) => {
    setCustomDateValue(value);
    
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = value.match(dateRegex);
    
    if (match) {
      const [_, day, month, year] = match;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      const today = new Date();
      if (!isNaN(date.getTime()) && date <= today) {
        setSetup(prev => ({
          ...prev,
          period: 'CUSTOM',
          customStartDate: date
        }));
      }
    }
  };

  const handlePercentageInput = (value: string, isEntry: boolean) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    const decimalCount = (numericValue.match(/\./g) || []).length;
    if (decimalCount > 1) return;
    
    if (isEntry) {
      setEntryInputValue(numericValue);
      const parsedValue = parseFloat(numericValue);
      if (!isNaN(parsedValue)) {
        setSetup(prev => ({ ...prev, entryPercentage: parsedValue }));
      }
    } else {
      setStopInputValue(numericValue);
      const parsedValue = parseFloat(numericValue);
      if (!isNaN(parsedValue)) {
        setSetup(prev => ({ ...prev, stopPercentage: parsedValue }));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, isEntry: boolean) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value;
      
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        const formattedValue = `${parsedValue.toFixed(2)}%`;
        if (isEntry) {
          setEntryInputValue(formattedValue);
          setSetup(prev => ({ ...prev, entryPercentage: parsedValue }));
          setShowEntryOptions(false);
        } else {
          setStopInputValue(formattedValue);
          setSetup(prev => ({ ...prev, stopPercentage: parsedValue }));
          setShowStopOptions(false);
        }
      }
      input.blur();
    }
  };

  const availableIndices = INDICES.filter(
    (index) => setup.country === 'ALL' || index.country === setup.country
  );

  const availableStocks = STOCKS.filter(
    (stock) => stock.index === setup.index || setup.index === 'ALL'
  );

  useEffect(() => {
    setSetup((prev) => ({
      ...prev,
      stocks: availableStocks.map((stock) => stock.symbol),
    }));
    setSelectedStocks([]);
  }, [setup.index]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.percentage-input')) {
        setShowEntryOptions(false);
        setShowStopOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredStocks = availableStocks.filter(
    (stock) => 
      !selectedStocks.includes(stock.symbol) && (
        stock.symbol.toLowerCase().includes(stockFilter.toLowerCase()) ||
        stock.name.toLowerCase().includes(stockFilter.toLowerCase())
      )
  );

  const handleStockSelect = (symbol: string) => {
    const newSelectedStocks = [...selectedStocks, symbol];
    setSelectedStocks(newSelectedStocks);
    setSetup((prev) => ({
      ...prev,
      stocks: newSelectedStocks.length > 0 ? newSelectedStocks : availableStocks.map(s => s.symbol),
    }));
    setStockFilter('');
    setShowSuggestions(false);
  };

  const handleRemoveStock = (symbol: string) => {
    const newSelectedStocks = selectedStocks.filter(s => s !== symbol);
    setSelectedStocks(newSelectedStocks);
    setSetup((prev) => ({
      ...prev,
      stocks: newSelectedStocks.length > 0 ? newSelectedStocks : availableStocks.map(s => s.symbol),
    }));
  };

  const handleCountryChange = (country: Country) => {
    setSetup((prev) => {
      let newIndex = prev.index;
      if (country !== 'ALL') {
        const indexBelongsToCountry = INDICES.some(
          (index) => index.id === prev.index && index.country === country
        );
        if (!indexBelongsToCountry) {
          newIndex = 'ALL';
        }
      }

      return {
        ...prev,
        country,
        index: newIndex,
      };
    });
  };

  const handleIndexChange = (indexId: string) => {
    setSetup((prev) => {
      let newCountry = prev.country;
      if (indexId !== 'ALL') {
        const selectedIndex = INDICES.find((index) => index.id === indexId);
        if (selectedIndex) {
          newCountry = selectedIndex.country;
        }
      }

      return {
        ...prev,
        country: newCountry,
        index: indexId,
      };
    });
  };

  const handleSubmit = () => {
    if (!setup.period) {
      setValidationError(t('selectPeriod'));
      return;
    }
    setValidationError(null);
    onSubmit(setup);
  };

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{t('tradingSetup')}</h2>
            <p className="text-sm text-slate-500">{t('configureParameters')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t('operation')}</label>
          <select
            value={setup.operation}
            onChange={(e) =>
              setSetup((prev) => ({
                ...prev,
                operation: e.target.value as TradingSetup['operation'],
              }))
            }
            className="select"
          >
            <option value="BUY">{t('buy')}</option>
            <option value="SELL">{t('sell')}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t('country')}</label>
          <select
            value={setup.country}
            onChange={(e) => handleCountryChange(e.target.value as Country)}
            className="select"
          >
            <option value="ALL">All</option>
            <option value="BR">Brasil</option>
            <option value="US">United States</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t('index')}</label>
          <select
            value={setup.index}
            onChange={(e) => handleIndexChange(e.target.value)}
            className="select"
          >
            <option value="ALL">All</option>
            {availableIndices.map((index) => (
              <option key={index.id} value={index.id}>
                {index.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t('referencePrice')}</label>
          <select
            value={setup.referencePrice}
            onChange={(e) =>
              setSetup((prev) => ({
                ...prev,
                referencePrice: e.target.value as TradingSetup['referencePrice'],
              }))
            }
            className="select"
          >
            <option value="OPEN">{t('previousDayOpen')}</option>
            <option value="HIGH">{t('previousDayHigh')}</option>
            <option value="LOW">{t('previousDayLow')}</option>
            <option value="PREV_CLOSE">{t('previousDayClose')}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t('entryPercentage')}</label>
          <div className="relative percentage-input">
            <input
              type="text"
              placeholder={t('enterPercentage')}
              value={entryInputValue}
              onChange={(e) => handlePercentageInput(e.target.value, true)}
              onKeyDown={(e) => handleKeyDown(e, true)}
              onFocus={() => setShowEntryOptions(true)}
              className="input"
            />
            {showEntryOptions && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                {[1, 1.5, 2, 2.5, 3].map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setEntryInputValue(`${value.toFixed(2)}%`);
                      setSetup(prev => ({ ...prev, entryPercentage: value }));
                      setShowEntryOptions(false);
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-slate-50"
                  >
                    {value.toFixed(2)}%
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t('stopPercentage')}</label>
          <div className="relative percentage-input">
            <input
              type="text"
              placeholder={t('enterPercentage')}
              value={stopInputValue}
              onChange={(e) => handlePercentageInput(e.target.value, false)}
              onKeyDown={(e) => handleKeyDown(e, false)}
              onFocus={() => setShowStopOptions(true)}
              className="input"
            />
            {showStopOptions && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                {[1, 1.5, 2, 2.5, 3].map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setStopInputValue(`${value.toFixed(2)}%`);
                      setSetup(prev => ({ ...prev, stopPercentage: value }));
                      setShowStopOptions(false);
                    }}
                    className="block w-full text-left px-3 py-2 hover:bg-slate-50"
                  >
                    {value.toFixed(2)}%
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t('period')}</label>
          <div className="space-y-2">
            {showCustomDateInput ? (
              <input
                type="text"
                placeholder={t('enterDate')}
                value={customDateValue}
                onChange={(e) => handleCustomDateChange(e.target.value)}
                onKeyDown={handleCustomDateKeyDown}
                className={`input ${validationError ? 'border-red-500 focus:ring-red-500' : ''}`}
                autoFocus
              />
            ) : (
              <select
                value={setup.period}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className={`select ${validationError ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">{t('selectPeriod')}</option>
                <option value="1M">1 {t('month')}</option>
                <option value="2M">2 {t('months')}</option>
                <option value="3M">3 {t('months')}</option>
                <option value="6M">6 {t('months')}</option>
                <option value="1Y">1 {t('year')}</option>
                <option value="CUSTOM">{t('customPeriod')}</option>
                {setup.period === 'CUSTOM' && setup.customStartDate && (
                  <option value={setup.period}>{t('customPeriod')}: {setup.customStartDate.toLocaleDateString()}</option>
                )}
              </select>
            )}
            {validationError && (
              <p className="text-sm text-red-500">{validationError}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t('initialCapital')}</label>
          <input
            type="text"
            value={setup.initialCapital.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
            onChange={(e) => {
              const value = parseFloat(e.target.value.replace(/[^0-9.-]+/g, ''));
              setSetup((prev) => ({
                ...prev,
                initialCapital: isNaN(value) ? 0 : value,
              }));
            }}
            className="input"
          />
        </div>
      </div>

      <div className="relative w-full sm:w-1/2">
        <label className="text-sm font-medium text-slate-700">{t('compareStocks')}</label>
        <div className="mt-1 flex flex-wrap gap-2 p-3 border border-slate-200 rounded-lg bg-white min-h-[42px]">
          {selectedStocks.map((symbol) => (
            <span
              key={symbol}
              className="badge badge-success"
            >
              {symbol}
              <button
                type="button"
                onClick={() => handleRemoveStock(symbol)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={selectedStocks.length > 0 ? t('addMoreStocks') : t('filterStocks')}
            className="flex-1 outline-none min-w-[120px] text-sm"
          />
        </div>
        {showSuggestions && stockFilter && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {filteredStocks.map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => handleStockSelect(stock.symbol)}
                className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
              >
                <div className="font-medium text-slate-900">{stock.symbol}</div>
                <div className="text-sm text-slate-500">{stock.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        className="btn btn-primary w-full"
      >
        {t('showResults')}
      </button>
    </div>
  );
}