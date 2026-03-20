import { useState, useMemo, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import { SERVICOS, TIPOS_SERVICO } from './CriarCotacoes'
import { gerarPdfFactura, downloadPdfFactura } from '../utils/gerarPdfFactura'
import { generateFacturaId, saveFactura } from '../utils/facturaStorage'
import { logo, papelTimbrado } from '../imagens'
import './CriarCotacoes.css'
import './FacturacaoServico.css'

function calcularPeriodoTexto(dataInicio, dataFim) {
  if (!dataInicio || !dataFim) return ''
  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || fim < inicio) return ''
  const diffMs = fim.getTime() - inicio.getTime()
  const dias = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1
  const semanas = (dias / 7).toFixed(1)
  return `${dias} dia(s) (${semanas} semana(s) aproximadas)`
}

const FACTURACAO_PENDING_KEY = 'facturacao_pending'

function FacturacaoServico() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt

  const editFactura = state?.editFactura
  const [cliente, setCliente] = useState(() => editFactura?.cliente ?? state?.cliente ?? null)
  const [observacoesNotas, setObservacoesNotas] = useState(() => editFactura?.observacoesNotas ?? state?.observacoesNotas ?? '')
  const [editId, setEditId] = useState(() => editFactura?.id ?? null)
  const [facturaIdGerada, setFacturaIdGerada] = useState(null)
  const checkedStorage = useRef(false)

  const [tipoServicoMae, setTipoServicoMae] = useState('ti')
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState(null)
  const [servicoOutro, setServicoOutro] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [valorBase, setValorBase] = useState('')
  const [taxaIVA, setTaxaIVA] = useState(16)
  const [emParcelas, setEmParcelas] = useState(false)
  const [primeiraPrestacaoValor, setPrimeiraPrestacaoValor] = useState('')
  const [primeiraPrestacaoDescricao, setPrimeiraPrestacaoDescricao] = useState('')
  const [segundaPrestacaoValor, setSegundaPrestacaoValor] = useState('')
  const [segundaPrestacaoDescricao, setSegundaPrestacaoDescricao] = useState('')

  useEffect(() => {
    if (editFactura) {
      setCliente(editFactura.cliente)
      setObservacoesNotas(editFactura.observacoesNotas || '')
      setEditId(editFactura.id)
      const s = SERVICOS.find((x) => x.nome === editFactura.servicoNome)
      setTipoServicoMae(s?.categoria || 'ti')
      setServicoSelecionadoId(editFactura.servicoOutro ? 'outro' : (s?.id || 'outro'))
      setServicoOutro(editFactura.servicoOutro || (SERVICOS.find((x) => x.nome === editFactura.servicoNome) ? '' : (editFactura.servicoNome || '')))
      setDataInicio(editFactura.dataInicio || '')
      setDataFim(editFactura.dataFim || '')
      setValorBase(String(editFactura.valorBase ?? ''))
      setTaxaIVA(editFactura.taxaIVA ?? 16)
      setEmParcelas(Boolean(editFactura.emParcelas))
      setPrimeiraPrestacaoValor(editFactura.primeiraPrestacaoValor ?? '')
      setPrimeiraPrestacaoDescricao(editFactura.primeiraPrestacaoDescricao ?? '')
      setSegundaPrestacaoValor(editFactura.segundaPrestacaoValor ?? '')
      setSegundaPrestacaoDescricao(editFactura.segundaPrestacaoDescricao ?? '')
      checkedStorage.current = true
      return
    }
    if (state?.cliente) {
      setCliente(state.cliente)
      setObservacoesNotas(state.observacoesNotas || '')
      checkedStorage.current = true
      return
    }
    if (checkedStorage.current) return
    checkedStorage.current = true
    try {
      const raw = sessionStorage.getItem(FACTURACAO_PENDING_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (data?.cliente) {
        setCliente(data.cliente)
        setObservacoesNotas(data.observacoesNotas || '')
        sessionStorage.removeItem(FACTURACAO_PENDING_KEY)
      }
    } catch (_) {}
  }, [state?.cliente, state?.observacoesNotas, editFactura])
  const [erro, setErro] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [pdfGerando, setPdfGerando] = useState(false)

  const servicosVisiveis = useMemo(() => SERVICOS.filter((s) => s.categoria === tipoServicoMae), [tipoServicoMae])
  const servicoSelecionado = useMemo(() => SERVICOS.find((s) => s.id === servicoSelecionadoId) || null, [servicoSelecionadoId])
  const periodoTexto = useMemo(() => calcularPeriodoTexto(dataInicio, dataFim), [dataInicio, dataFim])

  const valorNum = Number(valorBase) || 0
  const valorIVANum = (valorNum * taxaIVA) / 100
  const totalNum = valorNum + valorIVANum

  useEffect(() => {
    if (!checkedStorage.current) return
    if (cliente) return
    try {
      if (sessionStorage.getItem(FACTURACAO_PENDING_KEY)) return
    } catch (_) {}
    navigate('/facturacao', { replace: true })
  }, [cliente, navigate])

  if (!cliente) {
    return (
      <div className="pagina-criar-cotacoes pagina-facturacao-servico">
        <div className="wizard-layout">
          <p style={{ textAlign: 'center', padding: '2rem' }}>{t.aCarregar}</p>
        </div>
      </div>
    )
  }

  const nomeServico = servicoSelecionadoId === 'outro' ? servicoOutro : (servicoSelecionado?.nome || '')

  const gerarFactura = (e) => {
    e.preventDefault()
    setErro('')
    if (!servicoSelecionadoId && !servicoOutro.trim()) {
      setErro('Selecione um serviço ou indique "Outro" com a descrição.')
      return
    }
    if (servicoSelecionadoId === 'outro' && !servicoOutro.trim()) {
      setErro('Indique o tipo de serviço específico.')
      return
    }
    if (!dataInicio || !dataFim) {
      setErro('Preencha as datas de início e fim.')
      return
    }
    if (!valorBase || valorNum <= 0) {
      setErro('Indique o valor a cobrar pelo serviço.')
      return
    }
    const dados = {
      ...dadosFactura,
      id: editId || generateFacturaId(),
      emParcelas
    }
    saveFactura(dados)
    setFacturaIdGerada(dados.id)
    setEditId(dados.id)
    setMostrarModal(true)
  }

  const dadosFactura = useMemo(
    () => ({
      cliente,
      observacoesNotas: observacoesNotas.trim() || null,
      servicoNome: servicoSelecionado?.nome || null,
      servicoOutro: servicoOutro.trim() || null,
      servicoEspecificacoes: servicoSelecionadoId === 'outro'
        ? (servicoOutro.trim() ? [servicoOutro.trim()] : [])
        : (servicoSelecionado?.features || []),
      dataInicio,
      dataFim,
      periodoTexto,
      valorBase: valorNum,
      taxaIVA,
      primeiraPrestacaoValor: emParcelas ? primeiraPrestacaoValor : null,
      primeiraPrestacaoDescricao: emParcelas ? primeiraPrestacaoDescricao : null,
      segundaPrestacaoValor: emParcelas ? segundaPrestacaoValor : null,
      segundaPrestacaoDescricao: emParcelas ? segundaPrestacaoDescricao : null
    }),
    [cliente, observacoesNotas, servicoSelecionado, servicoSelecionadoId, servicoOutro, dataInicio, dataFim, periodoTexto, valorNum, taxaIVA, emParcelas, primeiraPrestacaoValor, primeiraPrestacaoDescricao, segundaPrestacaoValor, segundaPrestacaoDescricao]
  )

  const handleDescarregarPdf = async () => {
    setPdfGerando(true)
    try {
      const doc = await gerarPdfFactura(dadosFactura, logo, papelTimbrado)
      downloadPdfFactura(doc, 'Factura')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setPdfGerando(false)
    }
  }

  const mensagemTexto = useMemo(() => {
    const linhas = []
    linhas.push('FACTURA - SavilTech & Serviços Lda')
    linhas.push('')
    linhas.push('Cliente: ' + (cliente.tipoCliente === 'pessoal' ? cliente.formPessoal?.nomeCompleto : cliente.formEmpresarial?.nomeEmpresa))
    linhas.push('Serviço: ' + (nomeServico || '—'))
    linhas.push('Período: ' + (periodoTexto || '—'))
    linhas.push('Valor base: ' + valorNum.toLocaleString('pt-PT') + ' MZN')
    linhas.push('IVA (' + taxaIVA + '%): ' + valorIVANum.toLocaleString('pt-PT') + ' MZN')
    linhas.push('Total: ' + totalNum.toLocaleString('pt-PT') + ' MZN')
    if (emParcelas && (primeiraPrestacaoValor || primeiraPrestacaoDescricao || segundaPrestacaoValor || segundaPrestacaoDescricao)) {
      linhas.push('1ª fase: ' + (primeiraPrestacaoValor ? Number(primeiraPrestacaoValor).toLocaleString('pt-PT') : '—') + ' MZN' + (primeiraPrestacaoDescricao ? ' - ' + primeiraPrestacaoDescricao : ''))
      linhas.push('2ª fase: ' + (segundaPrestacaoValor ? Number(segundaPrestacaoValor).toLocaleString('pt-PT') : '—') + ' MZN' + (segundaPrestacaoDescricao ? ' - ' + segundaPrestacaoDescricao : ''))
    }
    return linhas.join('\n')
  }, [cliente, nomeServico, periodoTexto, valorNum, valorIVANum, totalNum, taxaIVA, emParcelas, primeiraPrestacaoValor, primeiraPrestacaoDescricao, segundaPrestacaoValor, segundaPrestacaoDescricao])

  const mailtoHref = 'mailto:info@saviltech.com?subject=' + encodeURIComponent('Factura SavilTech') + '&body=' + encodeURIComponent(mensagemTexto)
  const whatsappHref = 'https://wa.me/258833077953?text=' + encodeURIComponent(mensagemTexto)

  const handleEnviarEmail = async () => {
    setPdfGerando(true)
    try {
      const doc = await gerarPdfFactura(dadosFactura, logo, papelTimbrado)
      downloadPdfFactura(doc, 'Factura')
      window.open(mailtoHref, '_blank')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setPdfGerando(false)
    }
  }

  const handleEnviarWhatsApp = async () => {
    setPdfGerando(true)
    try {
      const doc = await gerarPdfFactura(dadosFactura, logo, papelTimbrado)
      downloadPdfFactura(doc, 'Factura')
      window.open(whatsappHref, '_blank')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setPdfGerando(false)
    }
  }

  return (
    <div className="pagina-criar-cotacoes pagina-facturacao-servico">
      <div className="wizard-header">
        <div className="wizard-etapas">
          <div className="etapa-item">1. {t.dadosCliente}</div>
          <div className="etapa-item ativa">2. {t.facturacaoServicoTitulo}</div>
        </div>
      </div>

      <div className="wizard-layout">
        <div className="wizard-col-principal">
          <button type="button" className="fact-servico-voltar" onClick={() => navigate(editId ? '/listar-facturas' : '/facturacao')}>
            ← {editId ? t.voltarListaFacturas : t.voltarDadosCliente}
          </button>

          {erro && <div className="alerta-erro">{erro}</div>}

          <form onSubmit={gerarFactura}>
            <div className="fact-servico-seccao">
              <h2>{t.facturacaoServicoTitulo}</h2>
              <div className="chips-servico-mae fact-servico-chips">
                {(TIPOS_SERVICO || []).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`chip-servico ${tipoServicoMae === cat.id ? 'ativo' : ''}`}
                    onClick={() => setTipoServicoMae(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="grelha-servicos fact-servico-grelha">
                {servicosVisiveis.map((s) => (
                  <div
                    key={s.id}
                    className={`cartao-servico ${servicoSelecionadoId === s.id ? 'selecionado' : ''}`}
                    onClick={() => { setServicoSelecionadoId(s.id); setServicoOutro('') }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && (setServicoSelecionadoId(s.id), setServicoOutro(''))}
                  >
                    <div className="cartao-servico-header">
                      <h3>{s.nome}</h3>
                    </div>
                    <p className="cartao-servico-resumo">{s.resumo}</p>
                    <ul className="cartao-servico-lista">
                      {s.features.slice(0, 4).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div
                  className={`cartao-servico cartao-servico-outro ${servicoSelecionadoId === 'outro' ? 'selecionado' : ''}`}
                  onClick={() => { setServicoSelecionadoId('outro'); setServicoOutro(servicoOutro) }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="cartao-servico-header">
                    <h3>Outro (especificar)</h3>
                  </div>
                  <p className="cartao-servico-resumo">Tipo de serviço não listado.</p>
                  {servicoSelecionadoId === 'outro' && (
                    <input
                      type="text"
                      className="fact-servico-outro-input"
                      placeholder="Descreva o serviço..."
                      value={servicoOutro}
                      onChange={(e) => { e.stopPropagation(); setServicoOutro(e.target.value) }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="fact-servico-seccao">
              <h2>{t.facturacaoPeriodoValor}</h2>
              <div className="linha-campos">
                <div className="campo">
                  <label htmlFor="dataInicioF">Data de início <span className="obrigatorio">*</span></label>
                  <input
                    id="dataInicioF"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div className="campo">
                  <label htmlFor="dataFimF">Data de fim <span className="obrigatorio">*</span></label>
                  <input
                    id="dataFimF"
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                  />
                </div>
                <div className="campo campo-periodo">
                  <label>Período calculado</label>
                  <div className="periodo-box">{periodoTexto || 'Selecione as datas.'}</div>
                </div>
              </div>
              <div className="linha-campos">
                <div className="campo">
                  <label htmlFor="valorBase">Valor a cobrar pelo serviço (MZN) <span className="obrigatorio">*</span></label>
                  <input
                    id="valorBase"
                    type="number"
                    min={0}
                    step={100}
                    value={valorBase}
                    onChange={(e) => setValorBase(e.target.value)}
                    placeholder="Valor que a SavilTech cobra"
                  />
                </div>
                <div className="campo">
                  <label htmlFor="taxaIVA">Taxa de IVA (%)</label>
                  <input
                    id="taxaIVA"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={taxaIVA}
                    onChange={(e) => setTaxaIVA(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="fact-servico-totais">
                <p><strong>IVA:</strong> {valorIVANum.toLocaleString('pt-PT')} MZN</p>
                <p><strong>Total:</strong> {totalNum.toLocaleString('pt-PT')} MZN</p>
              </div>
              <div className="fact-servico-parcelas">
                <label className="fact-servico-check">
                  <input
                    type="checkbox"
                    checked={emParcelas}
                    onChange={(e) => setEmParcelas(e.target.checked)}
                  />
                  {t.distribuirValor}
                </label>
                {emParcelas && (
                  <div className="fact-servico-parcelas-campos">
                    <p className="fact-distribuicao-hint">Consoante o valor a cobrar pelo serviço, distribua o total em duas fases e indique a finalidade de cada valor.</p>
                    <div className="fact-prestacao-bloco">
                      <h4>1ª fase</h4>
                      <div className="linha-campos">
                        <div className="campo">
                          <label htmlFor="primeiraValor">Valor (MZN)</label>
                          <input
                            id="primeiraValor"
                            type="number"
                            min={0}
                            value={primeiraPrestacaoValor}
                            onChange={(e) => setPrimeiraPrestacaoValor(e.target.value)}
                            placeholder="Ex.: metade do total"
                          />
                        </div>
                        <div className="campo campo-largo">
                          <label htmlFor="primeiraDescricao">{t.finalidadeValor}</label>
                          <input
                            id="primeiraDescricao"
                            type="text"
                            value={primeiraPrestacaoDescricao}
                            onChange={(e) => setPrimeiraPrestacaoDescricao(e.target.value)}
                            placeholder="Ex.: Fase de testes e implementação"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="fact-prestacao-bloco">
                      <h4>{t.segundaFase}</h4>
                      <div className="linha-campos">
                        <div className="campo">
                          <label htmlFor="segundaValor">Valor (MZN)</label>
                          <input
                            id="segundaValor"
                            type="number"
                            min={0}
                            value={segundaPrestacaoValor}
                            onChange={(e) => setSegundaPrestacaoValor(e.target.value)}
                            placeholder="Ex.: restante do total"
                          />
                        </div>
                        <div className="campo campo-largo">
                          <label htmlFor="segundaDescricao">{t.finalidadeValor}</label>
                          <input
                            id="segundaDescricao"
                            type="text"
                            value={segundaPrestacaoDescricao}
                            onChange={(e) => setSegundaPrestacaoDescricao(e.target.value)}
                            placeholder="Ex.: Implementação e uso definitivo do sistema"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="barra-acoes">
              <button type="submit" className="btn-primario">
                {editId ? 'Guardar alterações' : 'Gerar factura (PDF)'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {mostrarModal && (
        <div className="cotacao-modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="cotacao-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cotacao-modal-header">
              <h2>{t.facturaGerada}</h2>
              <button type="button" className="cotacao-modal-fechar" onClick={() => setMostrarModal(false)} aria-label="Fechar">×</button>
            </div>
            <div className="cotacao-modal-body">
              {facturaIdGerada && <p className="cotacao-modal-id">{t.idFactura}: <code>{facturaIdGerada}</code></p>}
              <p>{t.descarregarEnviar}</p>
              <div className="cotacao-modal-acoes">
                <button type="button" className="btn-modal btn-modal-pdf" onClick={handleDescarregarPdf} disabled={pdfGerando}>
                  📄 {pdfGerando ? t.aGerarPdf : t.descarregarPdf}
                </button>
                <button type="button" className="btn-modal email" onClick={handleEnviarEmail} disabled={pdfGerando}>✉ {t.enviarEmail}</button>
                <button type="button" className="btn-modal whatsapp" onClick={handleEnviarWhatsApp} disabled={pdfGerando}>🟢 {t.enviarWhatsApp}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FacturacaoServico
