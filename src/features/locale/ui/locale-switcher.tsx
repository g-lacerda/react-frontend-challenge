import { Check, Languages } from 'lucide-react'
import { LOCALES, useLocaleStore, useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

export function LocaleSwitcher() {
  const { t, locale } = useTranslation()
  const setLocale = useLocaleStore((state) => state.setLocale)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label={t.locale.label} title={t.locale.label}>
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        {LOCALES.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => setLocale(option)}
            className="justify-between text-[12.5px]"
          >
            {t.locale[option]}
            {option === locale ? <Check className="size-3.5" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
