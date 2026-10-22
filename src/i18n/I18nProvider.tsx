import React from 'react';
import type { AppLanguage } from '../types';
import { I18nContext } from './I18nContext';
import { translations } from './translations';

interface Props {
  lang: AppLanguage;
  children: React.ReactNode;
}

export const I18nProvider: React.FC<Props> = ({ lang, children }) => (
  <I18nContext.Provider value={{ t: translations[lang], lang }}>
    {children}
  </I18nContext.Provider>
);
