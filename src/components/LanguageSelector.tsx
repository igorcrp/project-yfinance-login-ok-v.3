import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Languages } from 'lucide-react';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative group">
        <button
          className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          title={t('languageSelector')}
        >
          <Languages className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">
            {language.toUpperCase()}
          </span>
        </button>
        
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          <button
            onClick={() => setLanguage('pt')}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <img
              src="https://images.unsplash.com/photo-1594135356513-14291e55162a?w=20&h=20&fit=crop"
              alt="Bandeira do Brasil"
              className="w-5 h-5 rounded-sm object-cover"
            />
            Português
          </button>
          <button
            onClick={() => setLanguage('en')}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <img
              src="https://images.unsplash.com/photo-1509475826633-fed577a2c71b?w=20&h=20&fit=crop"
              alt="USA Flag"
              className="w-5 h-5 rounded-sm object-cover"
            />
            English
          </button>
        </div>
      </div>
    </div>
  );
}