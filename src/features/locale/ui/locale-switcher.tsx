import { Check, Languages } from 'lucide-react'
import { LOCALES, useLocaleStore, useTranslation } from '@/shared/i18n'
import { playSound } from '@/shared/lib/sounds'
import { Button } from '@/shared/ui/button'
import { WithTooltip } from '@/shared/ui/with-tooltip'
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
    <DropdownMenu onOpenChange={(open) => open && playSound('open')}>
      <WithTooltip label={t.locale.label}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon-sm" aria-label={t.locale.label}>
            <Languages />
          </Button>
        </DropdownMenuTrigger>
      </WithTooltip>
      <DropdownMenuContent align="end" className="min-w-36">
        {LOCALES.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => {
              if (option !== locale) playSound('select')
              setLocale(option)
            }}
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
