import type { Language } from '../hooks/useUserSettings';
import type { TranslationKeys } from './keys';

import fr from './locales/fr';
import en from './locales/en';
import es from './locales/es';
import de from './locales/de';
import pt from './locales/pt';
import zh from './locales/zh';
import hi from './locales/hi';
import ar from './locales/ar';
import bn from './locales/bn';
import ru from './locales/ru';
import id from './locales/id';
import ur from './locales/ur';
import ja from './locales/ja';
import tr from './locales/tr';
import vi from './locales/vi';
import ko from './locales/ko';
import it from './locales/it';
import th from './locales/th';
import mr from './locales/mr';
import ta from './locales/ta';
import te from './locales/te';
import sw from './locales/sw';
import pl from './locales/pl';
import uk from './locales/uk';
import nl from './locales/nl';
import ms from './locales/ms';
import ro from './locales/ro';
import fa from './locales/fa';
import gu from './locales/gu';
import my from './locales/my';
import ha from './locales/ha';
import am from './locales/am';

export const translations: Record<Language, TranslationKeys> = {
  fr, en, es, de, pt,
  zh, hi, ar, bn, ru,
  id, ur, ja, tr, vi,
  ko, it, th, mr, ta,
  te, sw, pl, uk, nl,
  ms, ro, fa, gu, my,
  ha, am,
};

export function getTranslation(lang: Language): TranslationKeys {
  return translations[lang] ?? translations.fr;
}

export type { TranslationKeys } from './keys';
