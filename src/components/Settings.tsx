import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { language, setLanguage, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-xl font-semibold text-gray-900">{t('settings')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('languageSelector')}</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setLanguage('pt')}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm ${
                    language === 'pt'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <img
                    src="https://flagcdn.com/w40/br.png"
                    alt="Bandeira do Brasil"
                    className="w-6 h-4 object-cover rounded-sm"
                  />
                  <span className="flex-1 text-left">Português</span>
                  {language === 'pt' && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm ${
                    language === 'en'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <img
                    src="https://flagcdn.com/w40/us.png"
                    alt="USA Flag"
                    className="w-6 h-4 object-cover rounded-sm"
                  />
                  <span className="flex-1 text-left">English</span>
                  {language === 'en' && (
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}