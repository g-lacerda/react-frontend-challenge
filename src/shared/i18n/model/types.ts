import type { ptBR } from '../locales/pt-BR'

export const LOCALES = ['pt-BR', 'en-US', 'es-ES'] as const

export type Locale = (typeof LOCALES)[number]

export type Dictionary = typeof ptBR
