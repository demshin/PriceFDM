import { createContext } from 'react';
import type { AppLanguage } from '../types';
import { translations, type TranslationKeys } from './translations';

export interface I18nContextValue {
  t: TranslationKeys;
  lang: AppLanguage;
}

export const I18nContext = createContext<I18nContextValue>({
  t: translations.ru,
  lang: 'ru',
});