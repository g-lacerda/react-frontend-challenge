import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
    }),
    { name: 'cinedash:settings' },
  ),
)
