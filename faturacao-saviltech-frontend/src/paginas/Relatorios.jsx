import { useState } from 'react'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import { getCotacoes } from '../utils/cotacaoStorage'
import { getFacturas } from '../utils/facturaStorage'
import { gerarPdfRelatorio, downloadPdfRelatorio, filtrarPorPeriodo } from '../utils/gerarPdfRelatorio'
import { logo, papelTimbrado } from '../imagens'
import './Relatorios.css'

function Relatorios() {
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [tipoRelatorio, setTipoRelatorio] = useState('cotacoes')
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')

  const handleGerar = async (e) => {
    e.preventDefault()
    setErro('')
    if (dataInicio && dataFim && new Date(dataFim) < new Date(dataInicio)) {
      setErro('A data de fim deve ser igual ou posterior à data de início.')
      return
    }
    setGerando(true)
    try {
      const itensBrutos = tipoRelatorio === 'facturas' ? getFacturas() : getCotacoes()
      const itens = filtrarPorPeriodo(itensBrutos, dataInicio || null, dataFim || null)
      const doc = await gerarPdfRelatorio(
        { tipo: tipoRelatorio, dataInicio: dataInicio || null, dataFim: dataFim || null, itens },
        logo,
        papelTimbrado
      )
      downloadPdfRelatorio(doc, tipoRelatorio, dataInicio || null, dataFim || null)
    } catch (err) {
      console.error('Erro ao gerar relatório:', err)
      setErro(t.relatoriosErroGerar)
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="pagina-relatorios">
      <div className="relatorios-header relatorios-header-btn">
        <h1>{t.relatorios}</h1>
        <p>{t.relatoriosDesc}</p>
      </div>

      <form className="relatorios-form" onSubmit={handleGerar}>
        <div className="relatorios-campos">
          <div className="relatorios-grupo">
            <label htmlFor="tipoRelatorio">Tipo de relatório</label>
            <select
              id="tipoRelatorio"
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value)}
              className="relatorios-select"
            >
              <option value="cotacoes">Relatório de Cotações</option>
              <option value="facturas">Relatório de Facturas</option>
            </select>
          </div>
          <div className="relatorios-grupo">
            <label htmlFor="dataInicio">Data de início</label>
            <input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="relatorios-input"
            />
          </div>
          <div className="relatorios-grupo">
            <label htmlFor="dataFim">{t.dataFim}</label>
            <input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="relatorios-input"
            />
          </div>
        </div>
        <p className="relatorios-hint">Deixe as datas em branco para incluir todos os registos no relatório.</p>
        {erro && <div className="relatorios-erro">{erro}</div>}
        <div className="relatorios-acoes">
          <button type="submit" className="relatorios-btn-gerar" disabled={gerando}>
            {gerando ? t.aGerarPdf : '📄 ' + t.gerarRelatorioPdf}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Relatorios
