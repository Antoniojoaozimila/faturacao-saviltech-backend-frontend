import { jsPDF } from 'jspdf'

const NUIT_EMPRESA = '401234567'
const LOCALIZACAO = 'Av. Kenneth Kaunda, N°8330, Maputo, Moçambique'
const NOME_EMPRESA = 'SavilTech & Serviços Lda'

async function imageToBase64(url) {
  if (!url) return null
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function desenharFundoPagina(doc, pageW, pageH, letterheadBase64) {
  if (letterheadBase64) {
    doc.addImage(letterheadBase64, 'PNG', 0, 0, pageW, pageH)
  } else {
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, pageW, pageH, 'F')
  }
}

function desenharCarimbo(doc, x, y, largura, altura, logoBase64) {
  doc.setDrawColor(26, 54, 93)
  doc.setLineWidth(0.5)
  doc.rect(x, y, largura, altura, 'S')
  doc.rect(x + 1, y + 1, largura - 2, altura - 2, 'S')
  doc.setFontSize(8)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(26, 54, 93)
  doc.text(NOME_EMPRESA, x + largura / 2, y + 6, { align: 'center' })
  doc.setFont(undefined, 'normal')
  doc.setTextColor(0, 0, 0)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', x + (largura - 20) / 2, y + 9, 20, 20)
    } catch (_) {}
  }
  const dataHoje = new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
  doc.setFontSize(7)
  doc.setTextColor(80, 80, 80)
  doc.text(dataHoje, x + largura / 2, y + altura - 18, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  const linhaRubricaY = y + altura - 10
  doc.setDrawColor(120, 120, 120)
  doc.setLineWidth(0.25)
  doc.line(x + 4, linhaRubricaY, x + largura - 4, linhaRubricaY)
  doc.setFontSize(6)
  doc.setFont(undefined, 'italic')
  doc.text(NOME_EMPRESA, x + largura / 2, linhaRubricaY + 4, { align: 'center' })
  doc.setFont(undefined, 'normal')
  doc.setTextColor(0, 0, 0)
}

/** Tabela de relatório: headers = array de strings, rows = array de arrays (cada linha) */
function desenharTabelaRelatorio(doc, startY, titulo, headers, rows, pageW) {
  const margin = 18
  const tableWidth = pageW - margin * 2
  const numCols = headers.length
  const colWidth = tableWidth / numCols
  const headerH = 8
  const cellPadding = 3

  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(26, 54, 93)
  doc.text(titulo, margin, startY)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(0, 0, 0)
  let y = startY + 6

  doc.setFillColor(26, 54, 93)
  for (let i = 0; i < numCols; i++) {
    doc.rect(margin + i * colWidth, y, colWidth, headerH, 'F')
  }
  doc.setDrawColor(26, 54, 93)
  doc.setLineWidth(0.3)
  doc.line(margin, y, margin + tableWidth, y)
  doc.line(margin, y + headerH, margin + tableWidth, y + headerH)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(8)
  doc.setFont(undefined, 'bold')
  headers.forEach((h, i) => {
    doc.text(String(h), margin + i * colWidth + colWidth / 2, y + headerH / 2 + 1.5, { align: 'center' })
  })
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, 'normal')
  y += headerH

  rows.forEach((row, idx) => {
    const cellHeights = row.map((cell) => {
      const txt = String(cell ?? '—')
      const linhas = doc.splitTextToSize(txt, colWidth - cellPadding * 2)
      return Math.max(6, linhas.length * 4 + 4)
    })
    const cellH = Math.max(...cellHeights)
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252)
      for (let i = 0; i < numCols; i++) {
        doc.rect(margin + i * colWidth, y, colWidth, cellH, 'F')
      }
    }
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.15)
    doc.line(margin, y, margin + tableWidth, y)
    doc.line(margin, y + cellH, margin + tableWidth, y + cellH)
    for (let i = 0; i <= numCols; i++) {
      doc.line(margin + i * colWidth, y, margin + i * colWidth, y + cellH)
    }
    doc.setFontSize(7)
    row.forEach((cell, i) => {
      const txt = String(cell ?? '—')
      const linhas = doc.splitTextToSize(txt, colWidth - cellPadding * 2)
      linhas.slice(0, 3).forEach((linha, j) => {
        doc.text(linha, margin + i * colWidth + cellPadding, y + 4 + j * 4)
      })
    })
    y += cellH
  })
  return y + 10
}

function filtrarPorPeriodo(itens, dataInicio, dataFim) {
  if (!dataInicio || !dataFim) return itens
  const ini = new Date(dataInicio)
  const fim = new Date(dataFim)
  fim.setHours(23, 59, 59, 999)
  return itens.filter((item) => {
    const d = item.createdAt || item.updatedAt
    if (!d) return false
    const date = new Date(d)
    return date >= ini && date <= fim
  })
}

export async function gerarPdfRelatorio({ tipo, dataInicio, dataFim, itens }, logoUrl, letterheadUrl = null) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 18

  let logoBase64 = null
  let letterheadBase64 = null
  if (logoUrl) logoBase64 = await imageToBase64(logoUrl)
  if (letterheadUrl) letterheadBase64 = await imageToBase64(letterheadUrl)

  desenharFundoPagina(doc, pageW, pageH, letterheadBase64)

  const logoW = 32
  const logoH = 32
  const logoX = (pageW - logoW) / 2
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', logoX, 10, logoW, logoH)
    } catch (_) {}
  }

  const tituloRelatorio = tipo === 'facturas' ? 'RELATÓRIO DE FACTURAS' : 'RELATÓRIO DE COTAÇÕES'
  doc.setFillColor(26, 54, 93)
  doc.rect(margin, 48, pageW - margin * 2, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text(tituloRelatorio, pageW / 2, 55.5, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, 'normal')

  doc.setFontSize(10)
  doc.text(`NUIT: ${NUIT_EMPRESA}`, margin, 68)
  doc.text(LOCALIZACAO, margin, 74)
  const periodoTexto = dataInicio && dataFim
    ? `Período: ${new Date(dataInicio).toLocaleDateString('pt-PT')} a ${new Date(dataFim).toLocaleDateString('pt-PT')}`
    : 'Período: Todos'
  doc.text(periodoTexto, margin, 80)
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, 85, pageW - margin, 85)

  const offsetConteudo = 92

  if (tipo === 'facturas') {
    const headers = ['ID', 'Cliente', 'Serviço', 'Total (MZN)', 'Data']
    const nomeCliente = (f) => {
      const c = f.cliente
      if (!c) return '—'
      return c.tipoCliente === 'pessoal' ? (c.formPessoal?.nomeCompleto || '—') : (c.formEmpresarial?.nomeEmpresa || '—')
    }
    const nomeServico = (f) => f.servicoOutro || f.servicoNome || '—'
    const totalF = (f) => {
      const base = Number(f.valorBase) || 0
      const iva = (base * (f.taxaIVA ?? 16)) / 100
      return (base + iva).toLocaleString('pt-PT')
    }
    const dataF = (f) => {
      const d = f.createdAt || f.updatedAt
      return d ? new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'
    }
    const rows = itens.map((f) => [f.id || '—', nomeCliente(f), nomeServico(f), totalF(f), dataF(f)])
    const totalGeral = itens.reduce((acc, f) => {
      const base = Number(f.valorBase) || 0
      const iva = (base * (f.taxaIVA ?? 16)) / 100
      return acc + base + iva
    }, 0)
    let y = desenharTabelaRelatorio(doc, offsetConteudo, 'Resumo de facturas', headers, rows, pageW)
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text(`Total de registos: ${itens.length}`, margin, y)
    doc.text(`Soma total (MZN): ${totalGeral.toLocaleString('pt-PT')}`, margin, y + 7)
    doc.setFont(undefined, 'normal')
    y += 20
    const carimboW = 52
    const carimboH = 42
    const carimboX = pageW - margin - carimboW
    const carimboY = Math.min(pageH - margin - carimboH - 8, y + 10)
    desenharCarimbo(doc, carimboX, carimboY, carimboW, carimboH, logoBase64)
  } else {
    const headers = ['ID', 'Cliente', 'Serviço', 'Valor (MZN)', 'Data']
    const nomeCliente = (c) => {
      if (c.tipoCliente === 'pessoal') return c.formPessoal?.nomeCompleto || '—'
      return c.formEmpresarial?.nomeEmpresa || '—'
    }
    const servicoNome = (c) => c.servicoSelecionado?.nome || '—'
    const dataC = (c) => {
      const d = c.createdAt || c.updatedAt
      return d ? new Date(d).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'
    }
    const rows = itens.map((c) => [
      c.id || '—',
      nomeCliente(c),
      servicoNome(c),
      c.valorProposto ? Number(c.valorProposto).toLocaleString('pt-PT') : '—',
      dataC(c)
    ])
    let y = desenharTabelaRelatorio(doc, offsetConteudo, 'Resumo de cotações', headers, rows, pageW)
    doc.setFontSize(9)
    doc.setFont(undefined, 'bold')
    doc.text(`Total de registos: ${itens.length}`, margin, y)
    doc.setFont(undefined, 'normal')
    y += 20
    const carimboW = 52
    const carimboH = 42
    const carimboX = pageW - margin - carimboW
    const carimboY = Math.min(pageH - margin - carimboH - 8, y + 10)
    desenharCarimbo(doc, carimboX, carimboY, carimboW, carimboH, logoBase64)
  }

  return doc
}

export function downloadPdfRelatorio(doc, tipo, dataInicio, dataFim) {
  const sufixo = dataInicio && dataFim
    ? `_${dataInicio}_${dataFim}`.replace(/-/g, '')
    : '_todos'
  doc.save(`Relatorio_${tipo}${sufixo}.pdf`)
}

export { filtrarPorPeriodo }
