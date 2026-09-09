import { Moon, Sun } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'
import { playSound } from '@/shared/lib/sounds'
import { Button } from '@/shared/ui/button'
import { WithTooltip } from '@/shared/ui/with-tooltip'
import { useThemeStore } from '../model/theme-store'

export function ThemeToggle() {
  const { t } = useTranslation()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const label = theme === 'dark' ? t.theme.useLight : t.theme.useDark

  function handleToggle() {
    playSound(theme === 'dark' ? 'toggleOn' : 'toggleOff')
    toggleTheme()
  }

  return (
    <WithTooltip label={label}>
      <Button variant="outline" size="icon-sm" onClick={handleToggle} aria-label={label} className="sm:size-9">
        {theme === 'dark' ? <Sun /> : <Moon />}
      </Button>
    </WithTooltip>
  )
}
