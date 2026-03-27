import { API_BASE, getAuthHeaders } from '../config/api.js'

export async function apiListarMensagens() {
  const res = await fetch(`${API_BASE}/api/mensagens`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Falha ao listar mensagens.')
  return res.json()
}

export async function apiResponderMensagem(id, resposta) {
  const res = await fetch(`${API_BASE}/api/mensagens/${id}/responder`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ resposta })
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.mensagem || 'Falha ao enviar resposta.')
  }
}
