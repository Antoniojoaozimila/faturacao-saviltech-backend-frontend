import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import { apiListarCotacoes } from '../services/cotacoesApi'
import './ListarCotacoes.css'

const normalizar = (s) => (s || '').toString().trim().toLowerCase()
const ITENS_POR_PAGINA_OPCOES = [5, 10]

function ListarCotacoes() {
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt
  const [cotacoes, setCotacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [itensPorPagina, setItensPorPagina] = useState(10)
  const [paginaAtual, setPaginaAtual] = useState(1)

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setErro('')
    apiListarCotacoes()
      .then((dados) => {
        if (!ativo) return
        const normalizados = (dados || []).map((c) => ({
          id: c.id,
          numero: c.numero,
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
    return () => { ativo = false }
  }, [])

  const cotacoesFiltradas = useMemo(() => {
    const q = normalizar(busca)
    return cotacoes.filter((c) => {
      const matchBusca = !q ||
        normalizar(c.id).includes(q) ||
        normalizar(c.numero).includes(q) ||
        normalizar(c.cliente).includes(q) ||
        normalizar(c.servico).includes(q) ||
        String(c.valor).includes(q)
      const matchEstado = filtroEstado === 'todos' || c.estado === filtroEstado
      return matchBusca && matchEstado
    })
  }, [cotacoes, busca, filtroEstado])

  const totalPaginas = Math.max(1, Math.ceil(cotacoesFiltradas.length / itensPorPagina))
  const paginaCorrigida = Math.min(paginaAtual, totalPaginas)
  const inicio = (paginaCorrigida - 1) * itensPorPagina
  const cotacoesPagina = useMemo(
    () => cotacoesFiltradas.slice(inicio, inicio + itensPorPagina),
    [cotacoesFiltradas, inicio, itensPorPagina]
  )

  const irParaPagina = (p) => {
    const n = Math.max(1, Math.min(p, totalPaginas))
    setPaginaAtual(n)
  }

  return (
    <div className="pagina-listar-cotacoes">
      <div className="listar-header listar-header-btn" aria-hidden="true">
        <h1>{t.listarCotacoes}</h1>
        <p>{t.listarDesc}</p>
      </div>

      {erro && <p className="listar-erro">{erro}</p>}

      {cotacoes.length > 0 && (
        <div className="listar-filtros">
          <div className="listar-pesquisa-wrap">
            <span className="listar-lupa" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="listar-input-pesquisa"
              placeholder="Filtrar por número, cliente, serviço, valor..."
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1) }}
            />
          </div>
          <select
            className="listar-filtro-tipo"
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPaginaAtual(1) }}
          >
            <option value="todos">{t.todos}</option>
            <option value="pendente">{t.pendentes}</option>
            <option value="aprovada">{t.aprovadas}</option>
            <option value="rejeitada">{t.rejeitadas}</option>
          </select>
          <select
            className="listar-filtro-por-pagina"
            value={itensPorPagina}
            onChange={(e) => { setItensPorPagina(Number(e.target.value)); setPaginaAtual(1) }}
          >
            {ITENS_POR_PAGINA_OPCOES.map((n) => (
              <option key={n} value={n}>{n} por página</option>
            ))}
          </select>
        </div>
      )}

      <div className="listar-tabela-wrap">
        {carregando ? (
          <div className="listar-vazio">
            <p>A carregar cotações…</p>
          </div>
        ) : cotacoes.length === 0 ? (
          <div className="listar-vazio">
            <p>{t.semCotacoes}</p>
            <Link to="/criar-cotacoes" className="listar-btn-criar">
              {t.criarPrimeiraCotacao}
            </Link>
          </div>
        ) : (
          <>
            <table className="listar-tabela">
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>{t.cliente}</th>
                  <th>{t.servico}</th>
                  <th>{t.valorMzn}</th>
                  <th>{t.data}</th>
                  <th>{t.estado}</th>
                  <th>{t.accoes}</th>
                </tr>
              </thead>
              <tbody>
                {cotacoesPagina.map((c) => {
                  const dataStr = new Date(c.data).toLocaleDateString(
                    idioma === 'pt' ? 'pt-PT' : 'en-US',
                    { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                  )
                  const valorStr = c.valor.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  return (
                    <tr key={c.id} className="listar-tr-hover">
                      <td className="listar-id">
                        <code>{c.numero || c.id}</code>
                      </td>
                      <td>{c.cliente}</td>
                      <td>{c.servico || '—'}</td>
                      <td className="listar-valor">{valorStr}</td>
                      <td>{dataStr}</td>
                      <td>{c.estado}</td>
                      <td>
                        <span className="listar-link-editar" aria-hidden="true">
                          —
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {totalPaginas > 1 && (
              <div className="listar-paginacao">
                <button
                  type="button"
                  className="listar-pag-btn"
                  disabled={paginaCorrigida <= 1}
                  onClick={() => irParaPagina(paginaCorrigida - 1)}
                  aria-label="Página anterior"
                >
                  ←
                </button>
                <div className="listar-pag-numeros">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      className={`listar-pag-num ${n === paginaCorrigida ? 'ativo' : ''}`}
                      onClick={() => irParaPagina(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="listar-pag-btn"
                  disabled={paginaCorrigida >= totalPaginas}
                  onClick={() => irParaPagina(paginaCorrigida + 1)}
                  aria-label="Página seguinte"
                >
                  →
                </button>
                <span className="listar-pag-info">
                  {t.paginaDe} {paginaCorrigida} de {totalPaginas}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ListarCotacoes
