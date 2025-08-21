import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className="language-switcher">
      <div className="language-dropdown">
        <button className="language-button">
          {languages.find(lang => lang.code === i18n.language)?.flag || '🌐'}
          <span className="language-text">
            {languages.find(lang => lang.code === i18n.language)?.name || 'Language'}
          </span>
          <span className="dropdown-arrow">▼</span>
        </button>
        <div className="language-menu">
          {languages.map((language) => (
            <button
              key={language.code}
              className={`language-option ${
                i18n.language === language.code ? 'active' : ''
              }`}
              onClick={() => changeLanguage(language.code)}
            >
              <span className="flag">{language.flag}</span>
              <span className="name">{language.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;