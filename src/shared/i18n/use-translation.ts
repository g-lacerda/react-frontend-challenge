import { enUS } from './locales/en-US'
import { esES } from './locales/es-ES'
import { ptBR } from './locales/pt-BR'
import { useLocaleStore } from './model/locale-store'
import type { Dictionary, Locale } from './model/types'

const dictionaries: Record<Locale, Dictionary> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale)
  return { t: dictionaries[locale], locale }
}
