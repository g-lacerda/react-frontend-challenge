import { useTranslation, useLocaleStore, LOCALES, type Locale } from '@/shared/i18n'
import { playSound } from '@/shared/lib/sounds'
import { useThemeStore, type Theme } from '@/features/theme'
import { Segmented } from '@/shared/ui/segmented'
import { Switch } from '@/shared/ui/switch'
import { useSettingsStore } from '../model/settings-store'

interface SettingRowProps {
  id: string
  label: string
  description: string
  children: React.ReactNode
}

function SettingRow({ id, label, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="grid gap-0.5">
        <span id={`${id}-label`} className="text-[15px] font-medium">
          {label}
        </span>
        <p className="text-xs text-ink-45">{description}</p>
      </div>
      <div className="shrink-0 sm:w-64">{children}</div>
    </div>
  )
}

export function SettingsForm() {
  const { t, locale } = useTranslation()
  const setLocale = useLocaleStore((state) => state.setLocale)
  const theme = useThemeStore((state) => state.theme)
  const setTheme = useThemeStore((state) => state.setTheme)
  const soundEnabled = useSettingsStore((state) => state.soundEnabled)
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled)

  function changeTheme(next: Theme) {
    if (next === theme) return
    playSound(next === 'light' ? 'toggleOn' : 'toggleOff')
    setTheme(next)
  }

  function changeLocale(next: Locale) {
    if (next === locale) return
    playSound('select')
    setLocale(next)
  }

  function toggleSound(enabled: boolean) {
    setSoundEnabled(enabled)
    if (enabled) playSound('toggleOn')
  }

  return (
    <div className="rounded-md border border-border bg-card px-4">
      <SettingRow id="setting-theme" label={t.settings.theme} description={t.settings.themeDescription}>
        <Segmented
          aria-labelledby="setting-theme-label"
          value={theme}
          onChange={changeTheme}
          options={[
            { value: 'dark', label: t.settings.dark },
            { value: 'light', label: t.settings.light },
          ]}
        />
      </SettingRow>

      <SettingRow id="setting-locale" label={t.settings.language} description={t.settings.languageDescription}>
        <Segmented
          aria-labelledby="setting-locale-label"
          value={locale}
          onChange={changeLocale}
          options={LOCALES.map((option) => ({ value: option, label: t.locale[option] }))}
        />
      </SettingRow>

      <SettingRow id="setting-sound" label={t.settings.sound} description={t.settings.soundDescription}>
        <div className="flex sm:justify-end">
          <Switch aria-labelledby="setting-sound-label" checked={soundEnabled} onCheckedChange={toggleSound} />
        </div>
      </SettingRow>
    </div>
  )
}
