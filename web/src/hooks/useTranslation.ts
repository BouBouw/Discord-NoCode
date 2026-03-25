import { useMemo } from 'react';
import { useUserSettings } from './useUserSettings';
import { getTranslation } from '../i18n';
import type { TranslationKeys } from '../i18n';

export function useTranslation() {
  const { settings } = useUserSettings();
  const lang = settings.defaultLanguage;
  const t: TranslationKeys = useMemo(() => getTranslation(lang), [lang]);
  return { t, lang };
}
