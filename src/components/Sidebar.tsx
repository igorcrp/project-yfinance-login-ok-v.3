import React, { useState } from 'react';
import { Home, Calendar, TrendingUp, Settings as SettingsIcon, LogOut, Menu, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Settings } from './Settings';

interface SidebarProps {
  onIntervalChange: (interval: string) => void;
  selectedInterval: string;
  onExpandChange?: (isExpanded: boolean) => void;
}

export function Sidebar({ onIntervalChange, selectedInterval, onExpandChange }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { t } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onExpandChange?.(newState);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className={`fixed top-4 z-50 bg-slate-900 p-2 rounded-r-lg transition-all duration-300 ${
          isExpanded ? 'left-60' : 'left-0'
        }`}
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      <div
        className={`bg-slate-900 text-slate-200 h-screen fixed left-0 top-0 transition-all duration-300 ${
          isExpanded ? 'w-60' : 'w-20'
        }`}
      >
        <div className={`p-6 border-b border-slate-800 ${isExpanded ? '' : 'px-4'}`}>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-500 flex-shrink-0" />
            {isExpanded && (
              <div>
                <h1 className="text-xl font-bold text-white">Alpha Quant</h1>
                <p className="text-xs text-slate-400">Financial Analysis System</p>
              </div>
            )}
          </div>
        </div>

        <nav className={`flex-1 ${isExpanded ? 'p-4' : 'p-2'} space-y-2`}>
          <div className="mb-6">
            <button
              onClick={() => onIntervalChange('HOME')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-[14px] ${
                selectedInterval === 'HOME'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={t('dashboard')}
            >
              <Home className="w-5 h-5" />
              {isExpanded && <span className="font-medium">{t('dashboard')}</span>}
            </button>
          </div>

          <div className="space-y-2">
            {isExpanded && (
              <h2 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t('tradingIntervals')}
              </h2>
            )}
            {[
              { id: 'DAYTRADE', label: t('daytrade'), icon: Calendar },
              { id: 'WEEKLY', label: t('weeklyPortfolio'), icon: Calendar },
              { id: 'MONTHLY', label: t('monthlyPortfolio'), icon: Calendar },
              { id: 'YEARLY', label: t('yearlyPortfolio'), icon: Calendar },
            ].map((interval) => {
              const Icon = interval.icon;
              return (
                <button
                  key={interval.id}
                  onClick={() => onIntervalChange(interval.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-[14px] ${
                    selectedInterval === interval.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={interval.label}
                >
                  <Icon className="w-5 h-5" />
                  {isExpanded && <span className="font-medium">{interval.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        <div className={`${isExpanded ? 'p-4' : 'p-2'} border-t border-slate-800`}>
          <div className="space-y-2">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-[14px]"
              title={t('settings')}
            >
              <SettingsIcon className="w-5 h-5" />
              {isExpanded && <span className="font-medium">{t('settings')}</span>}
            </button>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('logout')}
            >
              {isLoggingOut ? (
                <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )}
              {isExpanded && <span className="font-medium">{t('logout')}</span>}
            </button>
          </div>
        </div>
      </div>

      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
}