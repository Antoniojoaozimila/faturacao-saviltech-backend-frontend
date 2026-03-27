import { API_BASE, getAuthHeaders } from '../config/api.js'

export async function apiListarCotacoes() {
  const res = await fetch(`${API_BASE}/api/cotacoes`, {
    method: 'GET',
    headers: getAuthHeaders()
  })
  if (!res.ok) throw new Error('Falha ao listar cotações.')
  return res.json()
}

export async function apiCriarCotacaoSimples({ numero, cliente, valor, estado = 'pendente', servico }) {
  const res = await fetch(`${API_BASE}/api/cotacoes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ numero, cliente, valor, estado, servico })
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.mensagem || 'Falha ao criar cotação.')
  }
  return res.json()
}

