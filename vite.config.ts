import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Só o essencial da primeira tela é pré-carregado; o resto baixa quando a rota abre.
    modulePreload: { resolveDependencies: (_url, deps) => deps.filter((dep) => !/(table|sonner|dist)-/.test(dep)) },
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            { name: 'react', test: /node_modules\/(react|react-dom|scheduler)\// },
            { name: 'tanstack', test: /node_modules\/@tanstack\// },
            { name: 'radix', test: /node_modules\/(radix-ui|@radix-ui)\// },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
