import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import { getFacturaById, getFacturas } from '../utils/facturaStorage'
import { gerarPdfFactura, downloadPdfFactura } from '../utils/gerarPdfFactura'
import { logo, papelTimbrado } from '../imagens'
import './EditarCotacoes.css'

const normalizar = (s) => (s || '').toString().trim().toLowerCase()

function identificadorCliente(f) {
  const c = f?.cliente
  if (!c) return '—'
  if (c.tipoCliente === 'pessoal') return c.formPessoal?.nomeCompleto || '—'
  return c.formEmpresarial?.nomeEmpresa || '—'
}

function nomeServicoFactura(f) {
  return f?.servicoOutro || f?.servicoNome || '—'
}

function totalFactura(f) {
  if (!f) return 0
  const base = Number(f.valorBase) || 0
  const iva = (base * (f.taxaIVA ?? 16)) / 100
  return base + iva
}

function EditarFacturas() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt
  const [factura, setFactura] = useState(null)
  const [pdfGerando, setPdfGerando] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [naoEncontrada, setNaoEncontrada] = useState(false)

  useEffect(() => {
    if (id) {
      const f = getFacturaById(id)
      if (f) {
        setFactura(f)
        setNaoEncontrada(false)
      } else {
        setNaoEncontrada(true)
        setFactura(null)
      }
    } else {
      setNaoEncontrada(false)
      setFactura(null)
    }
  }, [id])

  const facturas = useMemo(() => getFacturas().reverse(), [])
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

  const dataCriacao = (f) => {
    const d = f?.createdAt || f?.updatedAt
    if (!d) return '—'
    return new Date(d).toLocaleDateString(idioma === 'pt' ? 'pt-PT' : 'en-US', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const handleDescarregarPdf = async () => {
    if (!factura) return
    setPdfGerando(true)
    try {
      const doc = await gerarPdfFactura(factura, logo, papelTimbrado)
      downloadPdfFactura(doc, factura.id)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setPdfGerando(false)
    }
  }

  const mensagemParaEnvio = (f) => {
    const linhas = []
    linhas.push('ID da factura: ' + f.id + '\n')
    linhas.push('--- Dados do cliente ---')
    if (f.cliente?.tipoCliente === 'pessoal') {
      linhas.push('Nome: ' + (f.cliente.formPessoal?.nomeCompleto || '—'))
      linhas.push('Contacto: ' + (f.cliente.formPessoal?.telefone || f.cliente.formPessoal?.email || '—'))
    } else {
      linhas.push('Empresa: ' + (f.cliente?.formEmpresarial?.nomeEmpresa || '—'))
      linhas.push('Contacto: ' + (f.cliente?.formEmpresarial?.telefone || f.cliente?.formEmpresarial?.email || '—'))
    }
    linhas.push('--- Serviço ---')
    linhas.push('Serviço: ' + nomeServicoFactura(f))
    linhas.push('Período: ' + (f.periodoTexto || '—'))
    linhas.push('Total: ' + totalFactura(f).toLocaleString('pt-PT') + ' MZN')
    return linhas.join('\n')
  }

  const mailtoHref = factura ? 'mailto:info@saviltech.com?subject=' + encodeURIComponent('Factura ' + factura.id) + '&body=' + encodeURIComponent(mensagemParaEnvio(factura)) : ''
  const whatsappHref = factura ? 'https://wa.me/258833077953?text=' + encodeURIComponent(mensagemParaEnvio(factura)) : ''

  const handleEnviarEmail = async () => {
    if (!factura) return
    setPdfGerando(true)
    try {
      const doc = await gerarPdfFactura(factura, logo, papelTimbrado)
      downloadPdfFactura(doc, factura.id)
      window.open(mailtoHref, '_blank')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setPdfGerando(false)
    }
  }

  const handleEnviarWhatsApp = async () => {
    if (!factura) return
    setPdfGerando(true)
    try {
      const doc = await gerarPdfFactura(factura, logo, papelTimbrado)
      downloadPdfFactura(doc, factura.id)
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
          <h1>{t.editarFacturas}</h1>
          <p>{t.editarDescFacturas}</p>
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
            <option value="todos">{t.todos}</option>
            <option value="pessoal">{t.pessoal}</option>
            <option value="empresarial">{t.empresarial}</option>
          </select>
        </div>
        <div className="editar-lista-resultados">
          {facturas.length === 0 ? (
            <div className="editar-lista-vazio">
              <p>{t.editarListaVaziaFacturas}</p>
              <Link to="/facturacao" className="editar-btn-criar">{t.criarFactura}</Link>
            </div>
          ) : facturasFiltradas.length === 0 ? (
            <div className="editar-lista-vazio">
              <p>{t.nenhumaFacturaEncontrada} &quot;{busca}&quot;.</p>
            </div>
          ) : (
            <ul className="editar-lista-cards">
              {facturasFiltradas.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    className="editar-card"
                    onClick={() => navigate('/facturacao/servico', { state: { editFactura: f } })}
                  >
                    <span className="editar-card-id"><code>{f.id}</code></span>
                    <span className="editar-card-cliente">{identificadorCliente(f)}</span>
                    <span className="editar-card-servico">{nomeServicoFactura(f)}</span>
                    <span className="editar-card-valor">
                      {totalFactura(f).toLocaleString('pt-PT')} MZN
                    </span>
                    <span className="editar-card-data">{dataCriacao(f)}</span>
                    <span className="editar-card-acao">{t.editar} →</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="editar-lista-footer">
          <Link to="/listar-facturas" className="editar-link-listar">Ver Listar Facturas</Link>
        </div>
      </div>
    )
  }

  if (id && !factura) {
    return (
      <div className="pagina-editar-cotacoes">
        <h1>{t.editarFacturas}</h1>
        <p>{naoEncontrada ? t.facturaNaoEncontrada : t.abrirFormulario}</p>
        <Link to="/editar-facturas" className="editar-link-listar">{t.voltarPesquisa}</Link>
      </div>
    )
  }

  return (
    <div className="pagina-editar-cotacoes">
      <div className="editar-header">
        <div>
          <h1>{t.editarFacturas}</h1>
          <p className="editar-id"><strong>ID:</strong> <code>{factura.id}</code></p>
        </div>
        <Link to="/listar-facturas" className="editar-link-listar">← {t.listarFacturas}</Link>
      </div>
      <div className="editar-bloco">
        <h2>Dados do cliente</h2>
        <dl className="editar-dl">
          <dt>Tipo</dt>
          <dd>{factura.cliente?.tipoCliente === 'pessoal' ? 'Pessoal' : 'Empresarial'}</dd>
          {factura.cliente?.tipoCliente === 'pessoal' ? (
            <>
              <dt>Nome</dt>
              <dd>{factura.cliente.formPessoal?.nomeCompleto || '—'}</dd>
              <dt>Telefone / Email</dt>
              <dd>{factura.cliente.formPessoal?.telefone || '—'} / {factura.cliente.formPessoal?.email || '—'}</dd>
            </>
          ) : (
            <>
              <dt>Empresa</dt>
              <dd>{factura.cliente?.formEmpresarial?.nomeEmpresa || '—'}</dd>
              <dt>NUIT</dt>
              <dd>{factura.cliente?.formEmpresarial?.nuitEmpresa || '—'}</dd>
              <dt>Contacto</dt>
              <dd>{factura.cliente?.formEmpresarial?.telefone || '—'} / {factura.cliente?.formEmpresarial?.email || '—'}</dd>
            </>
          )}
        </dl>
      </div>
      <div className="editar-bloco">
        <h2>{t.servicoValores}</h2>
        <dl className="editar-dl">
          <dt>{t.servico}</dt>
          <dd>{nomeServicoFactura(factura)}</dd>
          <dt>Data início / fim</dt>
          <dd>{factura.dataInicio || '—'} a {factura.dataFim || '—'}</dd>
          <dt>Período</dt>
          <dd>{factura.periodoTexto || '—'}</dd>
          <dt>Valor base (MZN)</dt>
          <dd>{(factura.valorBase ?? 0).toLocaleString('pt-PT')}</dd>
          <dt>Total (MZN)</dt>
          <dd>{totalFactura(factura).toLocaleString('pt-PT')}</dd>
          {factura.observacoesNotas && (
            <>
              <dt>Observações</dt>
              <dd>{factura.observacoesNotas}</dd>
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
          onClick={() => navigate('/facturacao/servico', { state: { editFactura: factura } })}
        >
          {t.editarNoFormulario}
        </button>
      </div>
    </div>
  )
}

export default EditarFacturas
