import { Moon, Sun } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { useThemeStore } from '../model/theme-store'

export function ThemeToggle() {
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const label = theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'

  return (
    <Button variant="outline" size="icon-sm" onClick={toggleTheme} aria-label={label} title={label}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
