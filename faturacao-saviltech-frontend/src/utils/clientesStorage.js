import { getCotacoes } from './cotacaoStorage'

const CLIENTES_KEY = 'sistema_clientes'

function getClientesCadastro() {
  try {
    const raw = localStorage.getItem(CLIENTES_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function setClientesCadastro(list) {
  try {
    localStorage.setItem(CLIENTES_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Erro ao guardar clientes:', e)
  }
}

/** Extrai clientes únicos das cotações (pessoal e empresarial) e junta aos cadastrados manualmente; ordena por nome */
export function getClientes() {
  const cadastro = getClientesCadastro()
  const cotacoes = getCotacoes()
  const porChave = new Map()

  cotacoes.forEach((c) => {
    if (c.tipoCliente === 'pessoal' && c.formPessoal) {
      const nome = (c.formPessoal.nomeCompleto || '').trim()
      if (!nome) return
      const chave = `p-${nome.toLowerCase()}-${(c.formPessoal.email || '').toLowerCase()}`
      if (!porChave.has(chave)) {
        const partes = nome.split(/\s+/).filter(Boolean)
        porChave.set(chave, {
          tipo: 'pessoal',
          nomeCompleto: nome,
          primeiroNome: partes[0] || '',
          apelido: partes.slice(1).join(' ') || '',
          genero: c.formPessoal.genero || '',
          telefone: c.formPessoal.telefone || '',
          whatsapp: c.formPessoal.whatsapp || '',
          email: c.formPessoal.email || '',
          nacionalidade: c.formPessoal.nacionalidade || ''
        })
      }
    } else if (c.tipoCliente === 'empresarial' && c.formEmpresarial) {
      const nome = (c.formEmpresarial.nomeEmpresa || '').trim()
      if (!nome) return
      const chave = `e-${nome.toLowerCase()}-${(c.formEmpresarial.nuitEmpresa || '').trim()}`
      if (!porChave.has(chave)) {
        porChave.set(chave, {
          tipo: 'empresarial',
          nomeEmpresa: nome,
          nacionalidade: c.formEmpresarial.nacionalidade || '',
          nuitEmpresa: c.formEmpresarial.nuitEmpresa || '',
          setorAtividade: c.formEmpresarial.setorAtividade || '',
          endereco: c.formEmpresarial.endereco || '',
          telefone: c.formEmpresarial.telefone || '',
          whatsapp: c.formEmpresarial.whatsapp || '',
          email: c.formEmpresarial.email || '',
          website: c.formEmpresarial.website || ''
        })
      }
    }
  })

  cadastro.forEach((cl) => {
    const nome = (cl.tipo === 'pessoal' ? (cl.nomeCompleto || '').trim() : (cl.nomeEmpresa || '').trim())
    if (!nome) return
    const chave = cl.tipo === 'pessoal'
      ? `p-${nome.toLowerCase()}-${(cl.email || '').toLowerCase()}`
      : `e-${nome.toLowerCase()}-${(cl.nuitEmpresa || '').trim()}`
    if (!porChave.has(chave)) porChave.set(chave, { ...cl })
  })

  const lista = Array.from(porChave.values())
  lista.sort((a, b) => {
    const na = (a.tipo === 'pessoal' ? a.nomeCompleto : a.nomeEmpresa) || ''
    const nb = (b.tipo === 'pessoal' ? b.nomeCompleto : b.nomeEmpresa) || ''
    return na.localeCompare(nb, 'pt')
  })
  return lista
}

/** Regista um novo cliente no cadastro (quando preenche primeiro/último nome ou dados novos) */
export function registarCliente(cliente) {
  const list = getClientesCadastro()
  list.push({ ...cliente, registadoEm: new Date().toISOString() })
  setClientesCadastro(list)
}
