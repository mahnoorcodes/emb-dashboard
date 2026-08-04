import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Default base is root ('/') — correct for Hostinger, which serves this at
// your domain root. GitHub Pages needs '/emb-dashboard/' instead, since it
// serves from a subfolder — that override is passed via the --base flag in
// .github/workflows/deploy.yml, not hardcoded here, so both hosts work from
// the same source.
export default defineConfig({
  base: '/',
  plugins: [react()],
})