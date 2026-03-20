import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import { getClientes, registarCliente } from '../utils/clientesStorage'
import { apiListarClientes } from '../services/clientesApi'
import './CriarCotacoes.css'
import './Facturacao.css'

const PAISES_COMUNS = [
  'Moçambique', 'Portugal', 'Brasil', 'África do Sul', 'Angola', 'Estados Unidos', 'Reino Unido',
  'China', 'Índia', 'França', 'Alemanha', 'Espanha', 'Itália', 'Outro'
]

const normalizar = (s) => (s || '').toString().trim().toLowerCase()

function Facturacao() {
  const navigate = useNavigate()
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt

  const clientesLocais = useMemo(() => getClientes(), [])
  const [clientesSistema, setClientesSistema] = useState([])
  const [carregandoClientes, setCarregandoClientes] = useState(false)
  const [buscaCliente, setBuscaCliente] = useState('')
  const [clienteSelecionado, setClienteSelecionado] = useState(null)
  const [tipoCliente, setTipoCliente] = useState('pessoal')

  useEffect(() => {
    if (!buscaCliente.trim()) {
      setClientesSistema([])
      return
    }
    let cancel = false
    setCarregandoClientes(true)
    apiListarClientes(buscaCliente.trim())
      .then((lista) => {
        if (!cancel) setClientesSistema(lista)
      })
      .catch(() => { if (!cancel) setClientesSistema([]) })
      .finally(() => { if (!cancel) setCarregandoClientes(false) })
    return () => { cancel = true }
  }, [buscaCliente])

  const clientes = useMemo(() => {
    const locais = clientesLocais || []
    const sistema = (clientesSistema || []).map((c) => ({
      tipo: 'pessoal',
      nomeCompleto: c.cliente || '',
      primeiroNome: (c.cliente || '').split(/\s+/)[0] || '',
      apelido: (c.cliente || '').split(/\s+/).slice(1).join(' ') || '',
      email: c.email_cliente || '',
      telefone: c.telefone_cliente || '',
      whatsapp: c.telefone_cliente || '',
      fromSistema: true
    }))
    const porChave = new Map()
    sistema.forEach((s) => {
      const k = `s-${(s.nomeCompleto + s.email).toLowerCase()}`
      if (!porChave.has(k)) porChave.set(k, s)
    })
    locais.forEach((l) => {
      const nome = l.tipo === 'pessoal' ? (l.nomeCompleto || l.primeiroNome + ' ' + l.apelido) : l.nomeEmpresa
      const k = `l-${(nome + (l.email || '')).toLowerCase()}`
      if (!porChave.has(k)) porChave.set(k, l)
    })
    return Array.from(porChave.values())
  }, [clientesLocais, clientesSistema])

  const [formPessoal, setFormPessoal] = useState({
    primeiroNome: '',
    apelido: '',
    nomeCompleto: '',
    genero: 'masculino',
    telefone: '',
    whatsapp: '',
    email: '',
    nacionalidade: 'Moçambique'
  })
  const [formEmpresarial, setFormEmpresarial] = useState({
    nomeEmpresa: '',
    nuitEmpresa: '',
    nacionalidade: 'Moçambique',
    setorAtividade: '',
    endereco: '',
    telefone: '',
    whatsapp: '',
    email: '',
    website: ''
  })

  const [observacoesNotas, setObservacoesNotas] = useState('')
  const [erro, setErro] = useState('')

  const clientesFiltrados = useMemo(() => {
    const q = normalizar(buscaCliente)
    if (!q) return clientes
    return clientes.filter((c) => {
      const nome = c.tipo === 'pessoal' ? (c.nomeCompleto || c.primeiroNome + ' ' + c.apelido) : (c.nomeEmpresa || '')
      return normalizar(nome).includes(q) || normalizar(c.email || '').includes(q)
    })
  }, [clientes, buscaCliente])

  const selecionarCliente = (cl) => {
    setClienteSelecionado(cl)
    if (cl.tipo === 'pessoal') {
      setTipoCliente('pessoal')
      setFormPessoal({
        primeiroNome: cl.primeiroNome || (cl.nomeCompleto || '').split(/\s+/)[0] || '',
        apelido: cl.apelido || (cl.nomeCompleto || '').split(/\s+/).slice(1).join(' ') || '',
        nomeCompleto: cl.nomeCompleto || '',
        genero: cl.genero || 'masculino',
        telefone: cl.telefone || '',
        whatsapp: cl.whatsapp || '',
        email: cl.email || '',
        nacionalidade: cl.nacionalidade || 'Moçambique'
      })
    } else {
      setTipoCliente('empresarial')
      setFormEmpresarial({
        nomeEmpresa: cl.nomeEmpresa || '',
        nuitEmpresa: cl.nuitEmpresa || '',
        nacionalidade: cl.nacionalidade || 'Moçambique',
        setorAtividade: cl.setorAtividade || '',
        endereco: cl.endereco || '',
        telefone: cl.telefone || '',
        whatsapp: cl.whatsapp || '',
        email: cl.email || '',
        website: cl.website || ''
      })
    }
  }

  const FACTURACAO_PENDING_KEY = 'facturacao_pending'

  const submit = (e) => {
    e.preventDefault()
    setErro('')
    if (tipoCliente === 'pessoal') {
      const nome = (formPessoal.primeiroNome || '').trim() + ' ' + (formPessoal.apelido || '').trim()
      const nomeCompleto = nome.trim() || formPessoal.nomeCompleto
      if (!nomeCompleto || !formPessoal.telefone) {
        setErro('Preencha nome e telefone.')
        return
      }
      if (formPessoal.primeiroNome && formPessoal.apelido) {
        registarCliente({
          tipo: 'pessoal',
          primeiroNome: formPessoal.primeiroNome.trim(),
          apelido: formPessoal.apelido.trim(),
          nomeCompleto: (formPessoal.primeiroNome.trim() + ' ' + formPessoal.apelido.trim()).trim(),
          genero: formPessoal.genero,
          telefone: formPessoal.telefone,
          whatsapp: formPessoal.whatsapp,
          email: formPessoal.email,
          nacionalidade: formPessoal.nacionalidade
        })
      }
      const payload = {
        cliente: {
          tipoCliente: 'pessoal',
          formPessoal: { ...formPessoal, nomeCompleto: nomeCompleto || (formPessoal.primeiroNome + ' ' + formPessoal.apelido).trim() }
        },
        observacoesNotas: observacoesNotas.trim() || ''
      }
      try {
        sessionStorage.setItem(FACTURACAO_PENDING_KEY, JSON.stringify(payload))
      } catch (_) {}
      navigate('/facturacao/servico', { state: payload })
    } else {
      if (!formEmpresarial.nomeEmpresa || !formEmpresarial.telefone) {
        setErro('Preencha nome da empresa e telefone.')
        return
      }
      const payload = {
        cliente: { tipoCliente: 'empresarial', formEmpresarial: { ...formEmpresarial } },
        observacoesNotas: observacoesNotas.trim() || ''
      }
      try {
        sessionStorage.setItem(FACTURACAO_PENDING_KEY, JSON.stringify(payload))
      } catch (_) {}
      navigate('/facturacao/servico', { state: payload })
    }
  }

  return (
    <div className="pagina-criar-cotacoes pagina-facturacao">
      <div className="wizard-header">
        <div className="wizard-etapas">
          <div className="etapa-item ativa">
            <span className="etapa-num">1</span>
            <span className="etapa-texto">{t.dadosCliente}</span>
          </div>
          <div className="etapa-item">
            <span className="etapa-num">2</span>
            <span className="etapa-texto">{t.facturacaoServicoTitulo}</span>
          </div>
        </div>
      </div>

      <div className="wizard-layout">
        <div className="wizard-col-principal">
          <div className="facturacao-cliente-existente">
            <label>{t.facturacaoClienteOpcional}</label>
            <div className="facturacao-dropdown-wrap">
              <input
                type="text"
                className="facturacao-input-cliente"
                placeholder="Pesquisar por nome ou email..."
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
              />
              {buscaCliente && clientesFiltrados.length > 0 && (
                <ul className="facturacao-lista-clientes">
                  {clientesFiltrados.slice(0, 8).map((c, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        className="facturacao-item-cliente"
                        onClick={() => { selecionarCliente(c); setBuscaCliente('') }}
                      >
                        {c.tipo === 'pessoal'
                          ? (c.nomeCompleto || c.primeiroNome + ' ' + c.apelido).trim()
                          : c.nomeEmpresa}
                        {c.email && <span className="facturacao-item-email">{c.email}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="seletor-tipo-cliente">
            <button
              type="button"
              className={`btn-tipo ${tipoCliente === 'pessoal' ? 'ativo' : ''}`}
              onClick={() => setTipoCliente('pessoal')}
            >
              <span className="btn-tipo-titulo">{t.tipoPessoal}</span>
              <span className="btn-tipo-sub">{t.tipoPessoalSub}</span>
            </button>
            <button
              type="button"
              className={`btn-tipo ${tipoCliente === 'empresarial' ? 'ativo' : ''}`}
              onClick={() => setTipoCliente('empresarial')}
            >
              <span className="btn-tipo-titulo">{t.tipoEmpresarial}</span>
              <span className="btn-tipo-sub">{t.tipoEmpresarialSub}</span>
            </button>
          </div>

          {erro && <div className="alerta-erro">{erro}</div>}

          <form className={`form-cliente form-cliente-${tipoCliente}`} onSubmit={submit}>
            {tipoCliente === 'pessoal' ? (
              <>
                <div className="linha-campos">
                  <div className="campo">
                    <label htmlFor="primeiroNome">Primeiro nome</label>
                    <input
                      id="primeiroNome"
                      type="text"
                      value={formPessoal.primeiroNome}
                      onChange={(e) => setFormPessoal((f) => ({ ...f, primeiroNome: e.target.value }))}
                      placeholder="Nome próprio"
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="apelido">Apelido</label>
                    <input
                      id="apelido"
                      type="text"
                      value={formPessoal.apelido}
                      onChange={(e) => setFormPessoal((f) => ({ ...f, apelido: e.target.value }))}
                      placeholder="Apelido"
                    />
                  </div>
                </div>
                <div className="linha-campos">
                  <div className="campo">
                    <label htmlFor="generoF">Género</label>
                    <select
                      id="generoF"
                      value={formPessoal.genero}
                      onChange={(e) => setFormPessoal((f) => ({ ...f, genero: e.target.value }))}
                    >
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className="campo">
                    <label htmlFor="nacionalidadeF">Nacionalidade</label>
                    <select
                      id="nacionalidadeF"
                      value={formPessoal.nacionalidade}
                      onChange={(e) => setFormPessoal((f) => ({ ...f, nacionalidade: e.target.value }))}
                    >
                      {PAISES_COMUNS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="linha-campos">
                  <div className="campo">
                    <label htmlFor="telefoneF">Contacto (telefone) <span className="obrigatorio">*</span></label>
                    <input
                      id="telefoneF"
                      type="tel"
                      value={formPessoal.telefone}
                      onChange={(e) => setFormPessoal((f) => ({ ...f, telefone: e.target.value }))}
                      placeholder="+258 ..."
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="whatsappF">WhatsApp</label>
                    <input
                      id="whatsappF"
                      type="tel"
                      value={formPessoal.whatsapp}
                      onChange={(e) => setFormPessoal((f) => ({ ...f, whatsapp: e.target.value }))}
                      placeholder="+258 ..."
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="emailF">Email</label>
                    <input
                      id="emailF"
                      type="email"
                      value={formPessoal.email}
                      onChange={(e) => setFormPessoal((f) => ({ ...f, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                <div className="campo campo-observacoes">
                  <label htmlFor="observacoesF">Observações ou notas</label>
                  <textarea
                    id="observacoesF"
                    value={observacoesNotas}
                    onChange={(e) => setObservacoesNotas(e.target.value)}
                    placeholder="Notas adicionais para a factura..."
                    rows={3}
                  />
                </div>
                <div className="barra-acoes">
                  <button type="submit" className="btn-primario">
                    {t.avancarServico}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="linha-campos">
                  <div className="campo">
                    <label htmlFor="nomeEmpresaF">Nome da empresa <span className="obrigatorio">*</span></label>
                    <input
                      id="nomeEmpresaF"
                      type="text"
                      value={formEmpresarial.nomeEmpresa}
                      onChange={(e) => setFormEmpresarial((f) => ({ ...f, nomeEmpresa: e.target.value }))}
                      placeholder="Razão social"
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="nuitF">NUIT (opcional)</label>
                    <input
                      id="nuitF"
                      type="text"
                      value={formEmpresarial.nuitEmpresa}
                      onChange={(e) => setFormEmpresarial((f) => ({ ...f, nuitEmpresa: e.target.value }))}
                      placeholder="Número de identificação fiscal"
                    />
                  </div>
                </div>
                <div className="linha-campos">
                  <div className="campo">
                    <label htmlFor="nacionalidadeEmpF">Nacionalidade</label>
                    <select
                      id="nacionalidadeEmpF"
                      value={formEmpresarial.nacionalidade}
                      onChange={(e) => setFormEmpresarial((f) => ({ ...f, nacionalidade: e.target.value }))}
                    >
                      {PAISES_COMUNS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="campo">
                    <label htmlFor="enderecoF">Endereço</label>
                    <input
                      id="enderecoF"
                      type="text"
                      value={formEmpresarial.endereco}
                      onChange={(e) => setFormEmpresarial((f) => ({ ...f, endereco: e.target.value }))}
                      placeholder="Morada ou endereço da empresa"
                    />
                  </div>
                </div>
                <div className="linha-campos">
                  <div className="campo">
                    <label htmlFor="telefoneEmpF">Contacto (telefone) <span className="obrigatorio">*</span></label>
                    <input
                      id="telefoneEmpF"
                      type="tel"
                      value={formEmpresarial.telefone}
                      onChange={(e) => setFormEmpresarial((f) => ({ ...f, telefone: e.target.value }))}
                      placeholder="+258 ..."
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="whatsappEmpF">WhatsApp</label>
                    <input
                      id="whatsappEmpF"
                      type="tel"
                      value={formEmpresarial.whatsapp}
                      onChange={(e) => setFormEmpresarial((f) => ({ ...f, whatsapp: e.target.value }))}
                      placeholder="+258 ..."
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="emailEmpF">Email</label>
                    <input
                      id="emailEmpF"
                      type="email"
                      value={formEmpresarial.email}
                      onChange={(e) => setFormEmpresarial((f) => ({ ...f, email: e.target.value }))}
                      placeholder="email@empresa.com"
                    />
                  </div>
                </div>
                <div className="campo campo-observacoes">
                  <label htmlFor="observacoesEmpF">Observações ou notas</label>
                  <textarea
                    id="observacoesEmpF"
                    value={observacoesNotas}
                    onChange={(e) => setObservacoesNotas(e.target.value)}
                    placeholder="Notas adicionais para a factura..."
                    rows={3}
                  />
                </div>
                <div className="barra-acoes">
                  <button type="submit" className="btn-primario">
                    {t.avancarServico}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default Facturacao
