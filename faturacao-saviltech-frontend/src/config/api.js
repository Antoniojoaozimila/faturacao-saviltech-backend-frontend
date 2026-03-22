/**
 * URL base do backend (sem /api no final).
 *
 * Vite: defina VITE_API_URL no .env ou no build Docker.
 * Ex.: VITE_API_URL=http://147.93.89.17:3000
 *
 * Nota: variáveis VITE_* são incorporadas em build time — alterar no "Docker Manager"
 * só funciona se a plataforma reconstruir a imagem com esse ARG ou usar ficheiro .env no build.
 */
const FALLBACK_PROD = 'http://147.93.89.17:3000'
const FALLBACK_DEV = 'http://localhost:4000'

function resolveApiBase() {
  const env =
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined
  const trimmed = env != null ? String(env).trim() : ''
  if (trimmed) {
    return trimmed.replace(/\/$/, '')
  }
  // Desenvolvimento (npm run dev): backend típico na porta 4000
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    return FALLBACK_DEV
  }
  // Produção (build): mesmo padrão que o guia — IP público :3000
  return FALLBACK_PROD
}

export const API_BASE = resolveApiBase()

const STORAGE_TOKEN = 'sistema_cotacao_token'

export function getAuthHeaders() {
  const token = localStorage.getItem(STORAGE_TOKEN)
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
