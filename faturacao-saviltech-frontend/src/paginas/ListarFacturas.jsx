import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import { getFacturas } from '../utils/facturaStorage'
import './ListarCotacoes.css'

const normalizar = (s) => (s || '').toString().trim().toLowerCase()
const ITENS_POR_PAGINA_OPCOES = [5, 10]

function identificadorCliente(f) {
  const c = f.cliente
  if (!c) return '—'
  if (c.tipoCliente === 'pessoal') return c.formPessoal?.nomeCompleto || '—'
  return c.formEmpresarial?.nomeEmpresa || '—'
}

function nomeServicoFactura(f) {
  return f.servicoOutro || f.servicoNome || '—'
}

function totalFactura(f) {
  const base = Number(f.valorBase) || 0
  const iva = (base * (f.taxaIVA ?? 16)) / 100
  return base + iva
}

function ListarFacturas() {
  const navigate = useNavigate()
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt
  const [facturas] = useState(() => getFacturas().reverse())
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [itensPorPagina, setItensPorPagina] = useState(10)
  const [paginaAtual, setPaginaAtual] = useState(1)

  const dataCriacao = (f) => {
    const d = f.createdAt || f.updatedAt
    if (!d) return '—'
    return new Date(d).toLocaleDateString(idioma === 'pt' ? 'pt-PT' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const facturasFiltradas = useMemo(() => {
    const q = normalizar(busca)
    const tipo = filtroTipo
    return facturas.filter((f) => {
      const matchBusca = !q ||
        normalizar(f.id).includes(q) ||
        normalizar(identificadorCliente(f)).includes(q) ||
        normalizar(nomeServicoFactura(f)).includes(q) ||
        normalizar(String(totalFactura(f))).includes(q)
      const tipoCliente = f.cliente?.tipoCliente || 'pessoal'
      const matchTipo = tipo === 'todos' ||
        (tipo === 'pessoal' && tipoCliente === 'pessoal') ||
        (tipo === 'empresarial' && tipoCliente === 'empresarial')
      return matchBusca && matchTipo
    })
  }, [facturas, busca, filtroTipo])

  const totalPaginas = Math.max(1, Math.ceil(facturasFiltradas.length / itensPorPagina))
  const paginaCorrigida = Math.min(paginaAtual, totalPaginas)
  const inicio = (paginaCorrigida - 1) * itensPorPagina
  const facturasPagina = useMemo(
    () => facturasFiltradas.slice(inicio, inicio + itensPorPagina),
    [facturasFiltradas, inicio, itensPorPagina]
  )

  const irParaPagina = (p) => {
    const n = Math.max(1, Math.min(p, totalPaginas))
    setPaginaAtual(n)
  }

  return (
    <div className="pagina-listar-cotacoes pagina-listar-facturas">
      <div className="listar-header listar-header-btn" aria-hidden="true">
        <h1>{t.listarFacturas}</h1>
        <p>{t.listarDescFacturas}</p>
      </div>

      {facturas.length > 0 && (
        <div className="listar-filtros">
          <div className="listar-pesquisa-wrap">
            <span className="listar-lupa" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="listar-input-pesquisa"
              placeholder="Filtrar por ID, cliente, serviço, valor..."
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPaginaAtual(1) }}
            />
          </div>
          <select
            className="listar-filtro-tipo"
            value={filtroTipo}
            onChange={(e) => { setFiltroTipo(e.target.value); setPaginaAtual(1) }}
          >
            <option value="todos">{t.todos}</option>
            <option value="pessoal">{t.pessoal}</option>
            <option value="empresarial">{t.empresarial}</option>
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
        {facturas.length === 0 ? (
          <div className="listar-vazio">
            <p>{t.semFacturas}</p>
            <Link to="/facturacao" className="listar-btn-criar">
              {t.criarPrimeiraFactura}
            </Link>
          </div>
        ) : (
          <>
            <table className="listar-tabela">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Total (MZN)</th>
                  <th>Data</th>
                  <th>Acções</th>
                </tr>
              </thead>
              <tbody>
                {facturasPagina.map((f) => (
                  <tr
                    key={f.id}
                    className="listar-tr-hover"
                    onClick={() => navigate('/facturacao/servico', { state: { editFactura: f } })}
                  >
                    <td className="listar-id">
                      <code>{f.id}</code>
                    </td>
                    <td>{identificadorCliente(f)}</td>
                    <td>{nomeServicoFactura(f)}</td>
                    <td className="listar-valor">
                      {totalFactura(f).toLocaleString('pt-PT')}
                    </td>
                    <td>{dataCriacao(f)}</td>
                    <td>
                      <button
                        type="button"
                        className="listar-link-editar"
                        onClick={(e) => { e.stopPropagation(); navigate('/facturacao/servico', { state: { editFactura: f } }) }}
                      >
                        {t.editar}
                      </button>
                    </td>
                  </tr>
                ))}
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

export default ListarFacturas
