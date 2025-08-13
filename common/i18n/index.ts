import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from './translations/ar.json';
import en from './translations/en.json';

const resources = { en: { translation: en }, ar: { translation: ar } } as const;

async function getLanguage(): Promise<'en' | 'ar'> {
  try {
    const stored = await AsyncStorage.getItem('language');
    if (stored === 'ar' || stored === 'en') return stored;
  } catch {}
  return I18nManager.isRTL ? 'ar' : 'en';
}

export async function initI18n() {
  const lng = await getLanguage();
  await i18n.use(initReactI18next).init({ resources, lng, interpolation: { escapeValue: false } });
}

export default i18n;


