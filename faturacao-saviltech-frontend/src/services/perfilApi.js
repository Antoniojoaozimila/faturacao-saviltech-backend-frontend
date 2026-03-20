import { API_BASE, getAuthHeaders } from '../config/api'

export async function apiAtualizarPerfil(dados) {
  const res = await fetch(`${API_BASE}/api/auth/perfil`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(dados)
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.mensagem || 'Falha ao atualizar perfil.')
  return data
}
