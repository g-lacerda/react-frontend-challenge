import { configureSounds } from '@/shared/lib/sounds'
import { useSettingsStore } from './model/settings-store'

configureSounds(() => useSettingsStore.getState().soundEnabled)

export { useSettingsStore }
export { SettingsForm } from './ui/settings-form'
