import { useEffect, useMemo, useRef, useState } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import { apiListarCotacoes } from '../services/cotacoesApi'
import './Dashboard.css'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const COTACOES_MOCK = []

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const MESES_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
const MESES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const normalizar = (s) => (s || '').toString().trim().toLowerCase()

function calcCrescimentoPct(atual, anterior) {
  if (!anterior) return atual > 0 ? 100 : 0
  return ((atual - anterior) / anterior) * 100
}

function useCountUpNumber(valor, { durationMs = 650, decimals = 0 } = {}) {
  const [display, setDisplay] = useState(valor)
  const prevRef = useRef(valor)

  useEffect(() => {
    const from = prevRef.current
    const to = valor
    prevRef.current = valor

    if (from === to) {
      setDisplay(to)
      return
    }

    let rafId = null
    const start = performance.now()

    const step = (now) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      const next = from + (to - from) * eased
      const factor = Math.pow(10, decimals)
      setDisplay(Math.round(next * factor) / factor)
      if (t < 1) rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [valor, durationMs, decimals])

  return display
}

function Dashboard() {
  const { usuario } = useAuth()
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt

  const [cotacoes, setCotacoes] = useState(COTACOES_MOCK)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [ordenacao, setOrdenacao] = useState({ campo: 'data', dir: 'desc' })

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setErro('')
    apiListarCotacoes()
      .then((dados) => {
        if (!ativo) return
        const normalizados = (dados || []).map((c) => ({
          id: c.id,
          cliente: c.cliente,
          servico: c.servico || c.servico_principal || '—',
          valor: Number(c.valor) || Number(c.valor_total) || 0,
          estado: c.estado || 'pendente',
          data: c.data_criacao || c.data || new Date().toISOString()
        }))
        setCotacoes(normalizados)
      })
      .catch((e) => {
        console.error(e)
        if (ativo) setErro('Não foi possível carregar as cotações do servidor.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => {
      ativo = false
    }
  }, [])

  const total = cotacoes.length
  const pendentes = cotacoes.filter((c) => c.estado === 'pendente').length
  const aprovadas = cotacoes.filter((c) => c.estado === 'aprovada').length
  const rejeitadas = cotacoes.filter((c) => c.estado === 'rejeitada').length
  const totalValor = cotacoes.reduce((acc, c) => acc + (Number(c.valor) || 0), 0)
  const ticketMedio = total > 0 ? totalValor / total : 0
  const clientesUnicos = new Set(cotacoes.map((c) => normalizar(c.cliente))).size
  const taxaAprovacao = total > 0 ? (aprovadas / total) * 100 : 0

  const { crescCotacoesPct, crescValorPct } = useMemo(() => {
    const agora = new Date()
    const inicioAtual = new Date(agora)
    inicioAtual.setDate(inicioAtual.getDate() - 30)
    const inicioAnterior = new Date(agora)
    inicioAnterior.setDate(inicioAnterior.getDate() - 60)

    const atual = cotacoes.filter((c) => new Date(c.data) >= inicioAtual)
    const anterior = cotacoes.filter((c) => {
      const d = new Date(c.data)
      return d >= inicioAnterior && d < inicioAtual
    })

    const valorAtual = atual.reduce((acc, c) => acc + (Number(c.valor) || 0), 0)
    const valorAnterior = anterior.reduce((acc, c) => acc + (Number(c.valor) || 0), 0)

    return {
      crescCotacoesPct: calcCrescimentoPct(atual.length, anterior.length),
      crescValorPct: calcCrescimentoPct(valorAtual, valorAnterior)
    }
  }, [cotacoes])
  const mensagensNovas = 3

  const mesesLabels = idioma === 'fr' ? MESES_FR : idioma === 'en' ? MESES_EN : MESES
  const { labels12m, cotacoes12m } = useMemo(() => {
    const agora = new Date()
    const base = new Date(agora.getFullYear(), agora.getMonth() - 11, 1)
    const labels = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth() + i, 1)
      const mes = mesesLabels[d.getMonth()]
      return `${mes} ${d.getFullYear()}`
    })

    const contagem = new Array(12).fill(0)
    for (const c of cotacoes) {
      const d = new Date(c.data)
      const idx = (d.getFullYear() - base.getFullYear()) * 12 + (d.getMonth() - base.getMonth())
      if (idx >= 0 && idx < 12) contagem[idx] += 1
    }
    return { labels12m: labels, cotacoes12m: contagem }
  }, [cotacoes, mesesLabels])
  const dadosPie = [pendentes, aprovadas, rejeitadas]

  const { topClientesLabels, topClientesValores } = useMemo(() => {
    const mapa = new Map()
    for (const c of cotacoes) {
      const nome = (c.cliente || '').toString().trim() || '—'
      mapa.set(nome, (mapa.get(nome) || 0) + (Number(c.valor) || 0))
    }
    const top = [...mapa.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
    return {
      topClientesLabels: top.map(([k]) => k),
      topClientesValores: top.map(([, v]) => v)
    }
  }, [cotacoes])

  const chartPieOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    },
    animation: { duration: 800 }
  }), [])

  const chartPieData = useMemo(() => ({
    labels: [t.pendentes, t.aprovadas, t.rejeitadas],
    datasets: [{
      data: dadosPie,
      backgroundColor: ['#f59e0b', '#22c55e', '#ef4444'],
      borderColor: ['#f59e0b', '#22c55e', '#ef4444'],
      borderWidth: 2,
      hoverOffset: 8
    }]
  }), [t.pendentes, t.aprovadas, t.rejeitadas, pendentes, aprovadas, rejeitadas])

  const chartBarOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    },
    animation: { duration: 800 }
  }), [])

  const chartBarData = useMemo(() => ({
    labels: labels12m,
    datasets: [{
      label: t.totalCotacoes,
      data: cotacoes12m,
      backgroundColor: 'rgba(26, 54, 93, 0.7)',
      borderColor: 'rgba(26, 54, 93, 1)',
      borderWidth: 1,
      borderRadius: 6
    }]
  }), [labels12m, cotacoes12m, t.totalCotacoes])

  const chartTopClientesOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { beginAtZero: true }
    },
    animation: { duration: 800 }
  }), [])

  const chartTopClientesData = useMemo(() => ({
    labels: topClientesLabels,
    datasets: [{
      label: t.valorTotal || 'Valor total',
      data: topClientesValores,
      backgroundColor: 'rgba(43, 108, 176, 0.65)',
      borderColor: 'rgba(43, 108, 176, 1)',
      borderWidth: 1,
      borderRadius: 8
    }]
  }), [topClientesLabels, topClientesValores, t.valorTotal])

  const formatEstado = (est) => {
    if (est === 'pendente') return t.pendentes
    if (est === 'aprovada') return t.aprovadas
    return t.rejeitadas
  }

  const formatValor = (v) => {
    return new Intl.NumberFormat(idioma === 'pt' ? 'pt-PT' : idioma === 'fr' ? 'fr-FR' : 'en-US', {
      style: 'currency',
      currency: 'MZN'
    }).format(v)
  }

  const formatData = (d) => {
    return new Date(d).toLocaleDateString(idioma === 'pt' ? 'pt-PT' : idioma === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatPct = (v) => {
    const n = Number.isFinite(v) ? v : 0
    const s = n > 0 ? '+' : ''
    return `${s}${n.toFixed(1)}%`
  }

  const totalAnim = useCountUpNumber(total, { durationMs: 650, decimals: 0 })
  const pendentesAnim = useCountUpNumber(pendentes, { durationMs: 650, decimals: 0 })
  const aprovadasAnim = useCountUpNumber(aprovadas, { durationMs: 650, decimals: 0 })
  const rejeitadasAnim = useCountUpNumber(rejeitadas, { durationMs: 650, decimals: 0 })
  const clientesAnim = useCountUpNumber(clientesUnicos, { durationMs: 650, decimals: 0 })
  const valorTotalAnim = useCountUpNumber(totalValor, { durationMs: 650, decimals: 0 })
  const taxaAprovAnim = useCountUpNumber(taxaAprovacao, { durationMs: 650, decimals: 1 })

  const cotacoesTabela = useMemo(() => {
    const q = normalizar(pesquisa)
    const estado = filtroEstado

    const filtradas = cotacoes.filter((c) => {
      const matchTexto = !q
        || normalizar(c.cliente).includes(q)
        || normalizar(c.servico).includes(q)
        || normalizar(c.estado).includes(q)
        || normalizar(c.data).includes(q)
      const matchEstado = estado === 'todos' || c.estado === estado
      return matchTexto && matchEstado
    })

    const dir = ordenacao.dir === 'asc' ? 1 : -1
    const campo = ordenacao.campo

    const getVal = (c) => {
      if (campo === 'cliente') return normalizar(c.cliente)
      if (campo === 'servico') return normalizar(c.servico)
      if (campo === 'estado') return normalizar(c.estado)
      if (campo === 'valor') return Number(c.valor) || 0
      return new Date(c.data).getTime()
    }

    return [...filtradas].sort((a, b) => {
      const va = getVal(a)
      const vb = getVal(b)
      if (va < vb) return -1 * dir
      if (va > vb) return 1 * dir
      return 0
    })
  }, [cotacoes, pesquisa, filtroEstado, ordenacao])

  const cotacoesPendentes = useMemo(() => {
    return cotacoes
      .filter((c) => c.estado === 'pendente')
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 6)
  }, [cotacoes])

  const toggleOrdenacao = (campo) => {
    setOrdenacao((o) => {
      if (o.campo !== campo) return { campo, dir: 'asc' }
      return { campo, dir: o.dir === 'asc' ? 'desc' : 'asc' }
    })
  }

  const sortIndicador = (campo) => {
    if (ordenacao.campo !== campo) return '↕'
    return ordenacao.dir === 'asc' ? '↑' : '↓'
  }

  return (
    <div className="pagina-dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-titulo">{t.dashboard}</h1>
        <p className="dashboard-subtitulo">
          {t.bemVindo}, {usuario?.nome || 'Administrador'} {usuario?.apelido || 'Sistema'}.
        </p>
      </header>

      {erro && <p style={{ color: '#b91c1c', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{erro}</p>}

      <div className="dashboard-cards">
        <div className="dashboard-card card-anim" style={{ '--i': 0 }}>
          <div className="card-icon card-icon-total">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
          </div>
          <div className="card-conteudo">
            <span className="card-valor">{Math.round(totalAnim)}</span>
            <span className="card-titulo">{t.totalCotacoes}</span>
            <span className={`card-meta ${crescCotacoesPct >= 0 ? 'meta-up' : 'meta-down'}`}>
              {formatPct(crescCotacoesPct)} {t.crescimento} · {t.ultimos30Dias || 'últimos 30 dias'}
            </span>
          </div>
        </div>

        <div className="dashboard-card card-anim" style={{ '--i': 1 }}>
          <div className="card-icon card-icon-pendente">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </div>
          <div className="card-conteudo">
            <span className="card-valor">{Math.round(pendentesAnim)}</span>
            <span className="card-titulo">{t.pendentes}</span>
            <span className="card-meta">{pendentes > 0 ? ((pendentes / total) * 100).toFixed(0) : 0}% {t.doTotal}</span>
          </div>
        </div>

        <div className="dashboard-card card-anim" style={{ '--i': 2 }}>
          <div className="card-icon card-icon-aprovada">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          </div>
          <div className="card-conteudo">
            <span className="card-valor">{Math.round(aprovadasAnim)}</span>
            <span className="card-titulo">{t.aprovadas}</span>
            <span className="card-meta">{aprovadas > 0 ? ((aprovadas / total) * 100).toFixed(0) : 0}% {t.totalCotacoes.toLowerCase()}</span>
          </div>
        </div>

        <div className="dashboard-card card-anim" style={{ '--i': 3 }}>
          <div className="card-icon card-icon-valor">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <div className="card-conteudo">
            <span className="card-valor card-valor-moeda">{formatValor(valorTotalAnim)}</span>
            <span className="card-titulo">{t.valorTotal || 'Valor total'}</span>
            <span className={`card-meta ${crescValorPct >= 0 ? 'meta-up' : 'meta-down'}`}>
              {formatPct(crescValorPct)} {t.crescimento} · {t.ultimos30Dias || 'últimos 30 dias'}
            </span>
          </div>
        </div>

        <div className="dashboard-card card-anim" style={{ '--i': 4 }}>
          <div className="card-icon card-icon-clientes">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <div className="card-conteudo">
            <span className="card-valor">{Math.round(clientesAnim)}</span>
            <span className="card-titulo">{t.clientesUnicos || 'Clientes únicos'}</span>
            <span className="card-meta">{t.doTotal} {t.totalCotacoes.toLowerCase()}</span>
          </div>
        </div>

        <div className="dashboard-card card-anim" style={{ '--i': 5 }}>
          <div className="card-icon card-icon-taxa">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 6-6" /><path d="M19 8v5h-5" /></svg>
          </div>
          <div className="card-conteudo">
            <span className="card-valor">{taxaAprovAnim.toFixed(1)}%</span>
            <span className="card-titulo">{t.taxaAprovacao || 'Taxa de aprovação'}</span>
            <span className="card-meta">{t.aprovadas.toLowerCase()} / {t.totalCotacoes.toLowerCase()}</span>
          </div>
        </div>

        <div className="dashboard-card card-anim" style={{ '--i': 6 }}>
          <div className="card-icon card-icon-rejeitada">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
          </div>
          <div className="card-conteudo">
            <span className="card-valor">{Math.round(rejeitadasAnim)}</span>
            <span className="card-titulo">{t.rejeitadas}</span>
            <span className="card-meta">{rejeitadas > 0 ? ((rejeitadas / total) * 100).toFixed(0) : 0}% {t.doTotal}</span>
          </div>
        </div>

        <div className="dashboard-card card-anim" style={{ '--i': 7 }}>
          <div className="card-icon card-icon-msg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </div>
          <div className="card-conteudo">
            <span className="card-valor">{mensagensNovas}</span>
            <span className="card-titulo">{t.mensagensNovas}</span>
            <span className="card-meta">{t.mensagensRecentes}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-wrapper chart-anim">
          <h3>{t.distribuicaoEstado}</h3>
          <div className="chart-container chart-pie">
            <Pie data={chartPieData} options={chartPieOptions} />
          </div>
        </div>
        <div className="chart-wrapper chart-anim">
          <h3>{t.cotacoesPorMes}</h3>
          <div className="chart-container chart-bar">
            <Bar data={chartBarData} options={chartBarOptions} />
          </div>
        </div>
        <div className="chart-wrapper chart-anim">
          <h3>{t.topClientes || 'Top clientes (por valor)'}</h3>
          <div className="chart-container chart-top-clientes">
            <Bar data={chartTopClientesData} options={chartTopClientesOptions} />
          </div>
        </div>
      </div>

      <div className="dashboard-tabela-wrapper tabela-anim">
        <div className="tabela-header">
          <h3>{t.cotacoesRecentes}</h3>
          <div className="tabela-acoes">
            <div className="dashboard-filtros">
              <input
                className="input-pesquisa"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder={t.pesquisarCotacoes || 'Pesquisar cotações...'}
              />
              <select
                className="select-filtro"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                aria-label={t.filtroEstado || 'Filtrar estado'}
              >
                <option value="todos">{t.todos || 'Todos'}</option>
                <option value="pendente">{t.pendentes}</option>
                <option value="aprovada">{t.aprovadas}</option>
                <option value="rejeitada">{t.rejeitadas}</option>
              </select>
            </div>
            <Link to="/listar-cotacoes" className="link-ver-todas">{t.verTodas}</Link>
          </div>
        </div>
        <div className="tabela-scroll">
          <table className="dashboard-tabela">
            <thead>
              <tr>
                <th>
                  <button type="button" className="sort-btn" onClick={() => toggleOrdenacao('cliente')}>
                    {t.cliente} <span className="sort-ind">{sortIndicador('cliente')}</span>
                  </button>
                </th>
                <th className="col-servico">
                  <button type="button" className="sort-btn" onClick={() => toggleOrdenacao('servico')}>
                    {t.servico || 'Serviço'} <span className="sort-ind">{sortIndicador('servico')}</span>
                  </button>
                </th>
                <th>
                  <button type="button" className="sort-btn" onClick={() => toggleOrdenacao('valor')}>
                    {t.valor} <span className="sort-ind">{sortIndicador('valor')}</span>
                  </button>
                </th>
                <th>
                  <button type="button" className="sort-btn" onClick={() => toggleOrdenacao('estado')}>
                    {t.estado} <span className="sort-ind">{sortIndicador('estado')}</span>
                  </button>
                </th>
                <th>
                  <button type="button" className="sort-btn" onClick={() => toggleOrdenacao('data')}>
                    {t.data} <span className="sort-ind">{sortIndicador('data')}</span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {cotacoesTabela.length === 0 ? (
                <tr>
                  <td colSpan={5} className="tabela-vazia">
                    {t.semResultados || 'Sem resultados'}
                  </td>
                </tr>
              ) : (
                cotacoesTabela.map((c, i) => (
                  <tr key={c.id} className="tabela-row-anim" style={{ '--delay': i * 0.03 }}>
                    <td className="cell-primaria">
                      <span className="cell-titulo">{c.cliente}</span>
                      <span className="cell-subtitulo">#{c.id}</span>
                    </td>
                    <td className="col-servico">{c.servico || '—'}</td>
                    <td className="cell-num">{formatValor(c.valor)}</td>
                    <td><span className={`badge badge-${c.estado}`}>{formatEstado(c.estado)}</span></td>
                    <td>{formatData(c.data)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-tabela-wrapper tabela-anim tabela-secundaria">
        <div className="tabela-header">
          <h3>{t.pendentesAcoes || 'Pendentes (ações rápidas)'}</h3>
          <span className="tabela-subinfo">{pendentes} {t.pendentes.toLowerCase()}</span>
        </div>
        <div className="tabela-scroll">
          <table className="dashboard-tabela">
            <thead>
              <tr>
                <th>{t.cliente}</th>
                <th className="col-servico">{t.servico || 'Serviço'}</th>
                <th>{t.valor}</th>
                <th>{t.data}</th>
              </tr>
            </thead>
            <tbody>
              {cotacoesPendentes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="tabela-vazia">{t.semResultados || 'Sem resultados'}</td>
                </tr>
              ) : (
                cotacoesPendentes.map((c, i) => (
                  <tr key={c.id} className="tabela-row-anim" style={{ '--delay': i * 0.03 }}>
                    <td className="cell-primaria">
                      <span className="cell-titulo">{c.cliente}</span>
                      <span className="cell-subtitulo">#{c.id}</span>
                    </td>
                    <td className="col-servico">{c.servico || '—'}</td>
                    <td className="cell-num">{formatValor(c.valor)}</td>
                    <td>{formatData(c.data)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
