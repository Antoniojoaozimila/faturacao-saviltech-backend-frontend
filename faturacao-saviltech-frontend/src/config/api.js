/**
 * URL base do backend (Sistema de Cotação API).
 * Em desenvolvimento: http://localhost:4000
 * Define VITE_API_URL no .env para alterar.
 */
export const API_BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : 'http://147.93.89.17:3000'

const STORAGE_TOKEN = 'sistema_cotacao_token'

export function getAuthHeaders() {
  const token = localStorage.getItem(STORAGE_TOKEN)
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
