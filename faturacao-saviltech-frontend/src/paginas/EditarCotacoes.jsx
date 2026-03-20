import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import { getCotacaoById, getCotacoes } from '../utils/cotacaoStorage'
import { gerarPdfCotacao, downloadPdf } from '../utils/gerarPdfCotacao'
import { logo, papelTimbrado } from '../imagens'
import './EditarCotacoes.css'

const normalizar = (s) => (s || '').toString().trim().toLowerCase()

function EditarCotacoes() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt
  const [cotacao, setCotacao] = useState(null)
  const [pdfGerando, setPdfGerando] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [naoEncontrada, setNaoEncontrada] = useState(false)

  useEffect(() => {
    if (id) {
      const c = getCotacaoById(id)
      if (c) {
        setCotacao(c)
        setNaoEncontrada(false)
      } else {
        setNaoEncontrada(true)
        setCotacao(null)
      }
    } else {
      setNaoEncontrada(false)
      setCotacao(null)
    }
  }, [id])

  const cotacoes = useMemo(() => getCotacoes().reverse(), [])
  const cotacoesFiltradas = useMemo(() => {
    const q = normalizar(busca)
    const tipo = filtroTipo
    return cotacoes.filter((c) => {
      const matchBusca = !q ||
        normalizar(c.id).includes(q) ||
        normalizar(c.formPessoal?.nomeCompleto || '').includes(q) ||
        normalizar(c.formEmpresarial?.nomeEmpresa || '').includes(q) ||
        normalizar(c.servicoSelecionado?.nome || '').includes(q) ||
        normalizar(c.valorProposto || '').includes(q)
      const matchTipo = tipo === 'todos' ||
        (tipo === 'pessoal' && c.tipoCliente === 'pessoal') ||
        (tipo === 'empresarial' && c.tipoCliente === 'empresarial')
      return matchBusca && matchTipo
    })
  }, [cotacoes, busca, filtroTipo])

  const identificador = (c) => {
    if (c.tipoCliente === 'pessoal') return c.formPessoal?.nomeCompleto || '—'
    return c.formEmpresarial?.nomeEmpresa || '—'
  }
  const dataCriacao = (c) => {
    const d = c.createdAt || c.updatedAt
    if (!d) return '—'
    return new Date(d).toLocaleDateString(idioma === 'pt' ? 'pt-PT' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const mensagemParaEnvio = (c) => {
    const linhas = []
    linhas.push('ID da cotação: ' + c.id + '\n')
    linhas.push('--- Dados do cliente ---')
    if (c.tipoCliente === 'pessoal') {
      linhas.push('Nome: ' + (c.formPessoal?.nomeCompleto || '—'))
      linhas.push('Contacto: ' + (c.formPessoal?.telefone || c.formPessoal?.email || '—'))
    } else {
      linhas.push('Empresa: ' + (c.formEmpresarial?.nomeEmpresa || '—'))
      linhas.push('Contacto: ' + (c.formEmpresarial?.telefone || c.formEmpresarial?.email || '—'))
    }
    linhas.push('--- Serviço ---')
    linhas.push('Serviço: ' + (c.servicoSelecionado?.nome || '—'))
    linhas.push('Período: ' + (c.periodoTexto || '—'))
    linhas.push('Valor: ' + (c.valorProposto || '—') + ' MZN')
    return linhas.join('\n')
  }

  const handleDescarregarPdf = async () => {
    if (!cotacao) return
    setPdfGerando(true)
    try {
      const doc = await gerarPdfCotacao(cotacao, logo, papelTimbrado)
      downloadPdf(doc, cotacao.id)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setPdfGerando(false)
    }
  }

  const handleEnviarEmail = async () => {
    if (!cotacao) return
    setPdfGerando(true)
    try {
      const doc = await gerarPdfCotacao(cotacao, logo, papelTimbrado)
      downloadPdf(doc, cotacao.id)
      window.open(mailtoHref, '_blank')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setPdfGerando(false)
    }
  }

  const handleEnviarWhatsApp = async () => {
    if (!cotacao) return
    setPdfGerando(true)
    try {
      const doc = await gerarPdfCotacao(cotacao, logo, papelTimbrado)
      downloadPdf(doc, cotacao.id)
      window.open(whatsappHref, '_blank')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setPdfGerando(false)
    }
  }

  if (!id) {
    return (
      <div className="pagina-editar-cotacoes pagina-editar-lista">
        <div className="editar-lista-header editar-lista-header-btn" aria-hidden="true">
          <h1>{t.editarCotacoes}</h1>
          <p>{t.editarDesc}</p>
        </div>
        <div className="editar-lista-pesquisa">
          <div className="editar-pesquisa-wrap">
            <span className="editar-lupa" aria-hidden="true">🔍</span>
            <input
              type="text"
              className="editar-input-pesquisa"
              placeholder={t.pesquisarPlaceholder}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <select
            className="editar-filtro-tipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pessoal">Pessoal</option>
            <option value="empresarial">Empresarial</option>
          </select>
        </div>
        <div className="editar-lista-resultados">
          {cotacoes.length === 0 ? (
            <div className="editar-lista-vazio">
              <p>Ainda não existem cotações. Crie uma em Criar Cotações.</p>
              <Link to="/criar-cotacoes" className="editar-btn-criar">Criar cotação</Link>
            </div>
          ) : cotacoesFiltradas.length === 0 ? (
            <div className="editar-lista-vazio">
              <p>Nenhuma cotação encontrada para &quot;{busca}&quot;.</p>
            </div>
          ) : (
            <ul className="editar-lista-cards">
              {cotacoesFiltradas.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="editar-card"
                    onClick={() => navigate('/criar-cotacoes', { state: { editCotacao: c } })}
                  >
                    <span className="editar-card-id"><code>{c.id}</code></span>
                    <span className="editar-card-cliente">{identificador(c)}</span>
                    <span className="editar-card-servico">{c.servicoSelecionado?.nome || '—'}</span>
                    <span className="editar-card-valor">
                      {c.valorProposto ? Number(c.valorProposto).toLocaleString('pt-PT') + ' MZN' : '—'}
                    </span>
                    <span className="editar-card-data">{dataCriacao(c)}</span>
                    <span className="editar-card-acao">{t.editar} →</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="editar-lista-footer">
          <Link to="/listar-cotacoes" className="editar-link-listar">Ver Listar Cotações</Link>
        </div>
      </div>
    )
  }

  if (id && !cotacao) {
    return (
      <div className="pagina-editar-cotacoes">
        <h1>{t.editarCotacoes}</h1>
        <p>{naoEncontrada ? t.cotacaoNaoEncontrada : t.abrirFormulario}</p>
        <Link to="/editar-cotacoes" className="editar-link-listar">{t.voltarPesquisa}</Link>
      </div>
    )
  }

  const mailtoHref = 'mailto:info@saviltech.com?subject=' + encodeURIComponent('Cotação ' + cotacao.id) + '&body=' + encodeURIComponent(mensagemParaEnvio(cotacao))
  const whatsappHref = 'https://wa.me/258833077953?text=' + encodeURIComponent(mensagemParaEnvio(cotacao))

  return (
    <div className="pagina-editar-cotacoes">
      <div className="editar-header">
        <div>
          <h1>{t.editarCotacoes}</h1>
          <p className="editar-id"><strong>ID:</strong> <code>{cotacao.id}</code></p>
        </div>
        <Link to="/listar-cotacoes" className="editar-link-listar">← Listar Cotações</Link>
      </div>
      <div className="editar-bloco">
        <h2>{t.dadosCliente}</h2>
        <dl className="editar-dl">
          <dt>{t.tipo}</dt>
          <dd>{cotacao.tipoCliente === 'pessoal' ? t.pessoal : t.empresarial}</dd>
          {cotacao.tipoCliente === 'pessoal' ? (
            <>
              <dt>Nome</dt>
              <dd>{cotacao.formPessoal?.nomeCompleto || '—'}</dd>
              <dt>Telefone / Email</dt>
              <dd>{cotacao.formPessoal?.telefone || '—'} / {cotacao.formPessoal?.email || '—'}</dd>
            </>
          ) : (
            <>
              <dt>Empresa</dt>
              <dd>{cotacao.formEmpresarial?.nomeEmpresa || '—'}</dd>
              <dt>NUIT</dt>
              <dd>{cotacao.formEmpresarial?.nuitEmpresa || '—'}</dd>
              <dt>Contacto</dt>
              <dd>{cotacao.formEmpresarial?.telefone || '—'} / {cotacao.formEmpresarial?.email || '—'}</dd>
            </>
          )}
        </dl>
      </div>
      <div className="editar-bloco">
        <h2>Serviço e período</h2>
        <dl className="editar-dl">
          <dt>Serviço</dt>
          <dd>{cotacao.servicoSelecionado?.nome || '—'}</dd>
          <dt>Data início / fim</dt>
          <dd>{cotacao.dataInicio || '—'} a {cotacao.dataFim || '—'}</dd>
          <dt>Período</dt>
          <dd>{cotacao.periodoTexto || '—'}</dd>
          <dt>Valor proposto (MZN)</dt>
          <dd>{cotacao.valorProposto ? Number(cotacao.valorProposto).toLocaleString('pt-PT') : '—'}</dd>
          {cotacao.observacoes && (
            <>
              <dt>Observações</dt>
              <dd>{cotacao.observacoes}</dd>
            </>
          )}
        </dl>
      </div>
      <div className="editar-acoes">
        <button type="button" className="editar-btn editar-btn-pdf" onClick={handleDescarregarPdf} disabled={pdfGerando}>
          {pdfGerando ? t.aGerarPdf : t.descarregarPdf}
        </button>
        <button type="button" className="editar-btn editar-btn-email" onClick={handleEnviarEmail} disabled={pdfGerando}>{t.enviarEmail}</button>
        <button type="button" className="editar-btn editar-btn-whatsapp" onClick={handleEnviarWhatsApp} disabled={pdfGerando}>{t.enviarWhatsApp}</button>
        <button
          type="button"
          className="editar-btn editar-btn-form"
          onClick={() => navigate('/criar-cotacoes', { state: { editCotacao: cotacao } })}
        >
          {t.editarNoFormulario}
        </button>
      </div>
    </div>
  )
}
export default EditarCotacoes
