const STORAGE_KEY = 'sistema_cotacoes'

function getCotacoes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function setCotacoes(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Erro ao guardar cotações:', e)
  }
}

export function generateCotacaoId() {
  return 'COT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function saveCotacao(cotacao) {
  const list = getCotacoes()
  const existing = list.findIndex((c) => c.id === cotacao.id)
  const next = existing >= 0
    ? list.map((c, i) => (i === existing ? { ...cotacao, updatedAt: new Date().toISOString() } : c))
    : [...list, { ...cotacao, createdAt: new Date().toISOString() }]
  setCotacoes(next)
  return cotacao
}

export function getCotacaoById(id) {
  return getCotacoes().find((c) => c.id === id) || null
}

export { getCotacoes }
