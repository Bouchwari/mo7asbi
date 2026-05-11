import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar';

i18n
  .use(initReactI18next)
  .init({
    lng: 'ar',
    fallbackLng: 'ar',
    resources: { ar: { translation: ar } },
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v3',
  })
  .catch((err: unknown) => {
    console.error('[i18n] init failed:', err);
  });

export default i18n;
