import { Moon, Sun } from 'lucide-react'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { useThemeStore } from '../model/theme-store'

export function ThemeToggle() {
  const { t } = useTranslation()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const label = theme === 'dark' ? t.theme.useLight : t.theme.useDark

  return (
    <Button variant="outline" size="icon-sm" onClick={toggleTheme} aria-label={label} title={label}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
