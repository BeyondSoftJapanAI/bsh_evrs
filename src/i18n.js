import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';

const resources = {
  en: {
    translation: en
  },
  zh: {
    translation: zh
  },
  ja: {
    translation: ja
  }
};

// localStorageの言語設定を日本語に設定
if (!localStorage.getItem('i18nextLng') || localStorage.getItem('i18nextLng') === 'en') {
  localStorage.setItem('i18nextLng', 'ja');
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ja',
    lng: 'ja',
    debug: false,

    interpolation: {
      escapeValue: false
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

// 初期化後に日本語を確実に設定
setTimeout(() => {
  if (i18n.language !== 'ja') {
    i18n.changeLanguage('ja');
  }
}, 100);

export default i18n;