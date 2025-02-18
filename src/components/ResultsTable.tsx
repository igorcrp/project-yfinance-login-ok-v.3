import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import type { StockResult } from '../types';

interface ResultsTableProps {
  results: StockResult[];
  onViewDetails: (symbol: string) => void;
}

type SortField = keyof StockResult;
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function ResultsTable({ results, onViewDetails }: ResultsTableProps) {
  const { t } = useLanguage();
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return aValue.localeCompare(bValue) * direction;
    }
    return ((aValue as number) - (bValue as number)) * direction;
  });

  const totalPages = Math.ceil(sortedResults.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedResults = sortedResults.slice(startIndex, startIndex + pageSize);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 inline-block ml-1" /> : <ChevronDown className="w-4 h-4 inline-block ml-1" />;
  };

  const renderHeader = (field: SortField, label: string) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        <SortIcon field={field} />
      </div>
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-slate-900">{t('results')}</h2>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                {renderHeader('symbol', t('ticker'))}
                {renderHeader('tradingDays', t('businessDays'))}
                {renderHeader('numTrades', t('trades'))}
                {renderHeader('tradePercentage', '% Trades')}
                {renderHeader('numProfits', t('profits'))}
                {renderHeader('profitPercentage', '% Profits')}
                {renderHeader('numLosses', t('losses'))}
                {renderHeader('lossPercentage', '% Losses')}
                {renderHeader('numStops', t('stops'))}
                {renderHeader('stopPercentage', '% Stops')}
                {renderHeader('finalCapital', t('finalCapital'))}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('details')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paginatedResults.map((result) => (
                <tr key={result.symbol} className="hover:bg-slate-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {result.symbol}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {result.tradingDays.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {result.numTrades.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatNumber(result.tradePercentage)}%
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {result.numProfits.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatNumber(result.profitPercentage)}%
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {result.numLosses.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatNumber(result.lossPercentage)}%
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {result.numStops.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatNumber(result.stopPercentage)}%
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {formatNumber(result.finalCapital)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                    <button
                      onClick={() => onViewDetails(result.symbol)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title={t('details')}
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">{t('show')}</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="select w-20"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-slate-600">{t('entries')}</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary px-6"
          >
            {t('previous')}
          </button>
          <span className="text-sm text-slate-600 bg-white px-4 py-2 rounded-md border border-slate-200">
            {t('page')} {currentPage} {t('of')} {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary px-6"
          >
            {t('next')}
          </button>
        </div>

        <div className="text-sm text-slate-600">
          {t('showing')} {startIndex + 1} {t('to')} {Math.min(startIndex + pageSize, results.length)} {t('of')} {results.length} {t('entries')}
        </div>
      </div>
    </div>
  );
}