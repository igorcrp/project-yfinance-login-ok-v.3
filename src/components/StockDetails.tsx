import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { StockDetail, TradingSetup } from '../types';

interface StockDetailsProps {
  symbol: string;
  details: StockDetail[];
  setup: TradingSetup;
  onUpdateResults: (updatedSetup: Partial<TradingSetup>) => void;
  onBack: () => void;
}

type SortField = keyof StockDetail;
type SortDirection = 'asc' | 'desc';

export function StockDetails({ symbol, details, setup, onUpdateResults, onBack }: StockDetailsProps) {
  const { t, language } = useLanguage();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [localSetup, setLocalSetup] = useState({
    referencePrice: setup.referencePrice,
    entryPercentage: setup.entryPercentage,
    stopPercentage: setup.stopPercentage,
    initialCapital: setup.initialCapital,
  });
  const [showEntryOptions, setShowEntryOptions] = useState(false);
  const [showStopOptions, setShowStopOptions] = useState(false);
  const [entryInputValue, setEntryInputValue] = useState(`${setup.entryPercentage}%`);
  const [stopInputValue, setStopInputValue] = useState(`${setup.stopPercentage}%`);

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

  const handlePercentageInput = (value: string, isEntry: boolean) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parsedValue = parseFloat(numericValue);

    if (isEntry) {
      setEntryInputValue(value);
      if (!isNaN(parsedValue)) {
        setLocalSetup(prev => ({ ...prev, entryPercentage: parsedValue }));
      }
    } else {
      setStopInputValue(value);
      if (!isNaN(parsedValue)) {
        setLocalSetup(prev => ({ ...prev, stopPercentage: parsedValue }));
      }
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleUpdateResults = () => {
    onUpdateResults(localSetup);
  };

  const sortedDetails = [...details].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * direction;
    }
    return ((aValue as number) - (bValue as number)) * direction;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 inline-block ml-1" /> : <ChevronDown className="w-4 h-4 inline-block ml-1" />;
  };

  const renderHeader = (field: SortField, label: string, width: string = 'auto') => (
    <th 
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100`}
      style={{ width }}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        <SortIcon field={field} />
      </div>
    </th>
  );

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const chartData = details.map(detail => ({
    date: new Date(detail.date).toLocaleDateString(),
    capital: detail.currentCapital
  }));

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{symbol} {t('details')}</h1>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('back')}
          </button>
        </div>

        <div className="grid grid-cols-[250px_1fr] gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4" style={{ height: '450px' }}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('referencePrice')}
              </label>
              <select
                value={localSetup.referencePrice}
                onChange={(e) => setLocalSetup(prev => ({ 
                  ...prev, 
                  referencePrice: e.target.value as TradingSetup['referencePrice']
                }))}
                className="w-full rounded-md border border-gray-300 p-2"
              >
                <option value="OPEN">{t('previousDayOpen')}</option>
                <option value="HIGH">{t('previousDayHigh')}</option>
                <option value="LOW">{t('previousDayLow')}</option>
                <option value="PREV_CLOSE">{t('previousDayClose')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('entryPercentage')}
              </label>
              <div className="relative percentage-input">
                <input
                  type="text"
                  placeholder={t('enterPercentage')}
                  value={entryInputValue}
                  onChange={(e) => handlePercentageInput(e.target.value, true)}
                  onFocus={() => setShowEntryOptions(true)}
                  className="w-full rounded-md border border-gray-300 p-2"
                />
                {showEntryOptions && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-sm z-10">
                    {[1, 2, 3].map((value) => (
                      <button
                        key={value}
                        onClick={() => {
                          setEntryInputValue(`${value}%`);
                          setLocalSetup(prev => ({ ...prev, entryPercentage: value }));
                          setShowEntryOptions(false);
                        }}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('stopPercentage')}
              </label>
              <div className="relative percentage-input">
                <input
                  type="text"
                  placeholder={t('enterPercentage')}
                  value={stopInputValue}
                  onChange={(e) => handlePercentageInput(e.target.value, false)}
                  onFocus={() => setShowStopOptions(true)}
                  className="w-full rounded-md border border-gray-300 p-2"
                />
                {showStopOptions && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-sm z-10">
                    {[1, 2, 3].map((value) => (
                      <button
                        key={value}
                        onClick={() => {
                          setStopInputValue(`${value}%`);
                          setLocalSetup(prev => ({ ...prev, stopPercentage: value }));
                          setShowStopOptions(false);
                        }}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('initialCapital')}
              </label>
              <input
                type="text"
                value={formatNumber(localSetup.initialCapital)}
                onChange={(e) => {
                  const value = parseFloat(e.target.value.replace(/[^0-9.-]+/g, ''));
                  setLocalSetup(prev => ({
                    ...prev,
                    initialCapital: isNaN(value) ? 0 : value
                  }));
                }}
                className="w-full rounded-md border border-gray-300 p-2"
              />
            </div>

            <button
              onClick={handleUpdateResults}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-4"
            >
              {t('updateResults')}
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6" style={{ height: '450px' }}>
            <h2 className="text-lg font-semibold mb-4">{t('currentCapital')}</h2>
            <div style={{ height: 'calc(480px - 4rem)' }}>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={Math.floor(chartData.length / 15)}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    width={80}
                    tickFormatter={(value) => formatNumber(value, 0)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatNumber(value), t('currentCapital')]}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="capital" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  {renderHeader('date', t('date'), '100px')}
                  {renderHeader('open', t('open'), '80px')}
                  {renderHeader('close', t('close'), '80px')}
                  {renderHeader('high', t('high'), '80px')}
                  {renderHeader('low', t('low'), '80px')}
                  {renderHeader('volume', t('volume'), '100px')}
                  {renderHeader('suggestedEntryPrice', t('suggestedEntry'), '100px')}
                  {renderHeader('realPrice', t('realPrice'), '80px')}
                  {renderHeader('trade', t('trade'), '80px')}
                  {renderHeader('lotSize', t('lotSize'), '80px')}
                  {renderHeader('stopValue', t('stopValue'), '80px')}
                  {renderHeader('stopHit', t('stopHit'), '80px')}
                  {renderHeader('profitLoss', t('profitLoss'), '100px')}
                  {renderHeader('currentCapital', t('currentCapital'), '120px')}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedDetails.map((detail) => (
                  <tr key={detail.date} className="hover:bg-gray-50">
                    <td className="px-3 py-4 text-sm text-gray-900">
                      {new Date(detail.date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-right">
                      {formatNumber(detail.open)}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-right">
                      {formatNumber(detail.close)}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-right">
                      {formatNumber(detail.high)}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-right">
                      {formatNumber(detail.low)}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-right">
                      {detail.volume.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-right">
                      {formatNumber(detail.suggestedEntryPrice)}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-right">
                      {formatNumber(detail.realPrice)}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-center">
                      {detail.trade || '-'}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-right">
                      {detail.lotSize.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-right">
                      {formatNumber(detail.stopValue)}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-center">
                      {detail.stopHit ? (language === 'pt' ? 'Sim' : 'Yes') : ''}
                    </td>
                    <td className={`px-3 py-4 text-sm text-right ${
                      detail.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatNumber(detail.profitLoss)}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 text-right">
                      {formatNumber(detail.currentCapital)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}