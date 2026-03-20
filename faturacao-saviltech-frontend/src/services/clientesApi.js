import { API_BASE, getAuthHeaders } from '../config/api'

export async function apiListarClientes(q = '') {
  const params = q ? new URLSearchParams({ q }) : ''
  const res = await fetch(`${API_BASE}/api/clientes${params ? `?${params}` : ''}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Falha ao listar clientes.')
  return res.json()
}
