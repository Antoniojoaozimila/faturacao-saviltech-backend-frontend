/**
 * URL base do backend.
 * - Vazio (recomendado em produção com Docker): pedidos vão para /api no MESMO host
 *   (Nginx no contentor frontend faz proxy para o backend).
 * - Defina VITE_API_URL se a API estiver noutro domínio/porta (ex.: dev local).
 */
function resolveApiBase() {
  const raw =
    typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).replace(/\/$/, '')
  }
  return ''
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
