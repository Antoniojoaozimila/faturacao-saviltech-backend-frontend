import { API_BASE, getAuthHeaders } from '../config/api.js'

export async function apiListarUsuarios({ page = 1, limit = 5, q = '' } = {}) {
  const params = new URLSearchParams({ page, limit })
  if (q) params.set('q', q)
  const res = await fetch(`${API_BASE}/api/usuarios?${params}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Falha ao listar utilizadores.')
  return res.json()
}

export async function apiCriarUsuario(dados) {
  const res = await fetch(`${API_BASE}/api/usuarios`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(dados)
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.mensagem || 'Falha ao criar utilizador.')
  return data
}

export async function apiObterUsuario(id) {
  const res = await fetch(`${API_BASE}/api/usuarios/${id}`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Falha ao obter utilizador.')
  return res.json()
}

export async function apiAtualizarUsuario(id, dados) {
  const res = await fetch(`${API_BASE}/api/usuarios/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(dados)
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.mensagem || 'Falha ao atualizar utilizador.')
  return data
}
