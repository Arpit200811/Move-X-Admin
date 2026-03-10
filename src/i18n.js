import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Use environment variable or default for demo
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/translations/{{lng}}`,
    },
    interpolation: {
      escapeValue: false
    },
    detection: {
        order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage', 'cookie']
    }
  });

export default i18n;
