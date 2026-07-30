import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site from /<repo-name>/ — set base to match your repo name exactly.
// e.g. if your repo is github.com/mahnoor/emb-dashboard, base should be '/emb-dashboard/'
export default defineConfig({
  base: '/emb-dashboard/',
  plugins: [react(), tailwindcss()],
})
