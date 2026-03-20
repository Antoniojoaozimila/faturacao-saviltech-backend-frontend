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

function desenharTabela(doc, startY, titulo, rows, pageW) {
  const margin = 18
  const tableWidth = pageW - margin * 2
  const col1W = tableWidth * 0.38
  const col2W = tableWidth * 0.62
  const headerH = 9

  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(26, 54, 93)
  doc.text(titulo, margin, startY)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(0, 0, 0)
  let y = startY + 6
  const tableStartY = y

  doc.setFillColor(26, 54, 93)
  doc.rect(margin, y, col1W, headerH, 'F')
  doc.rect(margin + col1W, y, col2W, headerH, 'F')
  doc.setDrawColor(26, 54, 93)
  doc.setLineWidth(0.3)
  doc.line(margin, y, margin + tableWidth, y)
  doc.line(margin, y + headerH, margin + tableWidth, y + headerH)
  doc.line(margin + col1W, y, margin + col1W, y + headerH)
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.text('Campo', margin + col1W / 2, y + headerH / 2 + 1.5, { align: 'center' })
  doc.text('Valor', margin + col1W + col2W / 2, y + headerH / 2 + 1.5, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, 'normal')
  y += headerH

  rows.forEach(([label, value], idx) => {
    const valor = String(value ?? '—')
    const linhas = doc.splitTextToSize(valor, col2W - 8)
    const cellH = Math.max(headerH * 0.8, linhas.length * 5 + 4)
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252)
      doc.rect(margin, y, col1W, cellH, 'F')
      doc.rect(margin + col1W, y, col2W, cellH, 'F')
    }
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.15)
    doc.line(margin, y, margin + tableWidth, y)
    doc.line(margin, y + cellH, margin + tableWidth, y + cellH)
    doc.line(margin + col1W, y, margin + col1W, y + cellH)
    doc.line(margin + tableWidth, y, margin + tableWidth, y + cellH)
    doc.setFontSize(8)
    doc.setFont(undefined, 'bold')
    doc.text(String(label), margin + 3, y + cellH / 2 + 1.5)
    doc.setFont(undefined, 'normal')
    linhas.forEach((linha, i) => {
      doc.text(linha, margin + col1W + 4, y + 4 + i * 5)
    })
    y += cellH
  })
  doc.line(margin, tableStartY, margin, y)
  return y + 10
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

export async function gerarPdfFactura(dados, logoUrl, letterheadUrl = null) {
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

  doc.setFillColor(26, 54, 93)
  doc.rect(margin, 48, pageW - margin * 2, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('FACTURA', pageW / 2, 55.5, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, 'normal')

  doc.setFontSize(10)
  doc.text(`NUIT: ${NUIT_EMPRESA}`, margin, 68)
  doc.text(LOCALIZACAO, margin, 74)
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, 80, pageW - margin, 80)

  const cliente = dados.cliente || {}
  const tipoCliente = cliente.tipoCliente || 'pessoal'
  const clienteRows =
    tipoCliente === 'pessoal'
      ? [
          ['Tipo', 'Pessoal'],
          ['Nome', cliente.formPessoal?.nomeCompleto || '—'],
          ['Género', cliente.formPessoal?.genero || '—'],
          ['Nacionalidade', cliente.formPessoal?.nacionalidade || '—'],
          ['Telefone', cliente.formPessoal?.telefone || '—'],
          ['WhatsApp', cliente.formPessoal?.whatsapp || '—'],
          ['Email', cliente.formPessoal?.email || '—']
        ]
      : [
          ['Tipo', 'Empresarial'],
          ['Empresa', cliente.formEmpresarial?.nomeEmpresa || '—'],
          ['NUIT', cliente.formEmpresarial?.nuitEmpresa || '—'],
          ['Endereço', cliente.formEmpresarial?.endereco || '—'],
          ['Telefone', cliente.formEmpresarial?.telefone || '—'],
          ['Email', cliente.formEmpresarial?.email || '—']
        ]

  const inicioConteudo = 88
  desenharTabela(doc, inicioConteudo, 'Dados do cliente', clienteRows, pageW)

  // ——— PÁGINA 2: Dados do serviço solicitado (especificações do card ou texto "Outro") ———
  const offsetHeader = 38
  doc.addPage()
  desenharFundoPagina(doc, pageW, pageH, letterheadBase64)

  const nomeServicoDoc = (dados.servicoNome || dados.servicoOutro || '—').toString()
  const especificacoes = Array.isArray(dados.servicoEspecificacoes) ? dados.servicoEspecificacoes : []
  const servicoSolicitadoRows = [
    ['Serviço', nomeServicoDoc],
    ...especificacoes.map((esp, i) => ['Especificação ' + (i + 1), String(esp)])
  ]
  if (servicoSolicitadoRows.length === 1) {
    servicoSolicitadoRows.push(['Descrição', dados.servicoOutro || '—'])
  }
  desenharTabela(doc, offsetHeader, 'Dados do serviço solicitado', servicoSolicitadoRows, pageW)

  // ——— PÁGINA 3: Serviço e valores (mais abaixo para não ofuscar header; carimbo mais acima para não ofuscar footer) ———
  const offsetValores = 40
  const carimboOffsetFooter = 22

  doc.addPage()
  desenharFundoPagina(doc, pageW, pageH, letterheadBase64)

  const valorBase = dados.valorBase != null ? Number(dados.valorBase) : 0
  const taxaIVA = dados.taxaIVA != null ? Number(dados.taxaIVA) : 16
  const valorIVA = (valorBase * taxaIVA) / 100
  const total = valorBase + valorIVA
  const servicoRows = [
    ['Serviço', nomeServicoDoc],
    ['Data de início', (dados.dataInicio || '—').toString()],
    ['Data de fim', (dados.dataFim || '—').toString()],
    ['Período', (dados.periodoTexto || '—').toString()],
    ['Observações / Notas', (dados.observacoesNotas || '—').toString()],
    ['Valor base (MZN)', valorBase.toLocaleString('pt-PT')],
    [`IVA (${taxaIVA}%) (MZN)`, valorIVA.toLocaleString('pt-PT')],
    ['Total (MZN)', total.toLocaleString('pt-PT')],
    ['1ª fase – Valor (MZN)', dados.primeiraPrestacaoValor != null && String(dados.primeiraPrestacaoValor).trim() !== '' ? Number(dados.primeiraPrestacaoValor).toLocaleString('pt-PT') : '—'],
    ['1ª fase – Finalidade deste valor', (dados.primeiraPrestacaoDescricao || '—').toString()],
    ['2ª fase – Valor (MZN)', dados.segundaPrestacaoValor != null && String(dados.segundaPrestacaoValor).trim() !== '' ? Number(dados.segundaPrestacaoValor).toLocaleString('pt-PT') : '—'],
    ['2ª fase – Finalidade deste valor', (dados.segundaPrestacaoDescricao || '—').toString()]
  ]
  desenharTabela(doc, offsetValores, 'Serviço e valores', servicoRows, pageW)

  const carimboW = 52
  const carimboH = 42
  const carimboX = pageW - margin - carimboW
  const carimboY = pageH - margin - carimboH - carimboOffsetFooter
  desenharCarimbo(doc, carimboX, carimboY, carimboW, carimboH, logoBase64)

  return doc
}

export function downloadPdfFactura(doc, id) {
  doc.save(`Factura_${id || 'SavilTech'}.pdf`)
}
