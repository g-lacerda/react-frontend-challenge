import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  email: string | null
  login: (email: string) => void
  logout: () => void
}

export function createFakeToken() {
  return `cinedash.${crypto.randomUUID()}`
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      login: (email) => set({ token: createFakeToken(), email }),
      logout: () => set({ token: null, email: null }),
    }),
    { name: 'cinedash:auth' },
  ),
)

export function isAuthenticated() {
  return useAuthStore.getState().token !== null
}
