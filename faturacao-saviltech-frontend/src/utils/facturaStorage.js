const STORAGE_KEY = 'sistema_facturas'

function getFacturas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function setFacturas(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Erro ao guardar facturas:', e)
  }
}

export function generateFacturaId() {
  return 'FAC-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function saveFactura(factura) {
  const list = getFacturas()
  const existing = list.findIndex((f) => f.id === factura.id)
  const updated = { ...factura, updatedAt: new Date().toISOString() }
  const next = existing >= 0
    ? list.map((f, i) => (i === existing ? updated : f))
    : [...list, { ...updated, createdAt: new Date().toISOString() }]
  setFacturas(next)
  return factura
}

export function getFacturaById(id) {
  return getFacturas().find((f) => f.id === id) || null
}

export { getFacturas }
