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

/** Desenha o fundo (papel timbrado ou cor) em toda a página actual */
function desenharFundoPagina(doc, pageW, pageH, letterheadBase64) {
  if (letterheadBase64) {
    doc.addImage(letterheadBase64, 'PNG', 0, 0, pageW, pageH)
  } else {
    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, pageW, pageH, 'F')
  }
}

/** Tabela estilizada com cabeçalho e linhas (colunas: Campo | Valor) */
function desenharTabela(doc, startY, titulo, rows, pageW) {
  const margin = 18
  const tableWidth = pageW - margin * 2
  const col1W = tableWidth * 0.38
  const col2W = tableWidth * 0.62
  const lineH = 7
  const headerH = 9

  doc.setFontSize(11)
  doc.setFont(undefined, 'bold')
  doc.setTextColor(26, 54, 93)
  doc.text(titulo, margin, startY)
  doc.setFont(undefined, 'normal')
  doc.setTextColor(0, 0, 0)

  let y = startY + 6
  const tableStartY = y

  // Cabeçalho da tabela
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
    const alt = idx % 2 === 1
    if (alt) {
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

/** Carimbo com nome da empresa, logo maior e assinatura em rubrica na linha */
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
      const logoSize = 20
      doc.addImage(logoBase64, 'PNG', x + (largura - logoSize) / 2, y + 9, logoSize, logoSize)
    } catch (_) {}
  }

  const dataHoje = new Date().toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
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
  doc.setTextColor(60, 60, 60)
  doc.text(NOME_EMPRESA, x + largura / 2, linhaRubricaY + 4, { align: 'center' })
  doc.setFont(undefined, 'normal')
  doc.setTextColor(0, 0, 0)
}

export async function gerarPdfCotacao(dados, logoUrl, letterheadUrl = null) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 18

  let logoBase64 = null
  let letterheadBase64 = null
  if (logoUrl) logoBase64 = await imageToBase64(logoUrl)
  if (letterheadUrl) letterheadBase64 = await imageToBase64(letterheadUrl)

  // Primeira página: fundo
  desenharFundoPagina(doc, pageW, pageH, letterheadBase64)

  // Logo centrado no topo
  const logoW = 32
  const logoH = 32
  const logoX = (pageW - logoW) / 2
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', logoX, 10, logoW, logoH)
    } catch (e) {
      console.warn('Logo não adicionado ao PDF:', e)
    }
  }

  // Retângulo "Cotação válida por 30 dias"
  doc.setFillColor(26, 54, 93)
  doc.rect(margin, 48, pageW - margin * 2, 12, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont(undefined, 'bold')
  doc.text('Cotação válida por 30 dias', pageW / 2, 55.5, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, 'normal')

  doc.setFontSize(10)
  doc.text(`NUIT: ${NUIT_EMPRESA}`, margin, 68)
  doc.text(LOCALIZACAO, margin, 74)

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, 80, pageW - margin, 80)

  let y = 88

  // ——— PÁGINA 1: apenas Dados do cliente ———
  const tipoCliente = dados.tipoCliente || 'pessoal'
  const clienteRows =
    tipoCliente === 'pessoal'
      ? [
          ['Tipo', 'Pessoal'],
          ['Saudação', dados.formPessoal?.saudacao],
          ['Nome completo', dados.formPessoal?.nomeCompleto],
          ['Género', dados.formPessoal?.genero],
          ['Nacionalidade', dados.formPessoal?.nacionalidade],
          ['Data de nascimento', dados.formPessoal?.dataNascimento],
          ['B.I / Documento', dados.formPessoal?.bi],
          ['Telefone', dados.formPessoal?.telefone],
          ['WhatsApp', dados.formPessoal?.whatsapp],
          ['Email', dados.formPessoal?.email]
        ]
      : [
          ['Tipo', 'Empresarial'],
          ['Nacionalidade', dados.formEmpresarial?.nacionalidade],
          ['Nome da empresa', dados.formEmpresarial?.nomeEmpresa],
          ['NUIT da empresa', dados.formEmpresarial?.nuitEmpresa],
          ['Setor', dados.formEmpresarial?.setorAtividade],
          ['Website', dados.formEmpresarial?.website],
          ['Pessoa de contacto', dados.formEmpresarial?.pessoaContacto],
          ['Telefone', dados.formEmpresarial?.telefone],
          ['WhatsApp', dados.formEmpresarial?.whatsapp],
          ['Email', dados.formEmpresarial?.email]
        ]

  desenharTabela(doc, y, 'Dados do cliente', clienteRows, pageW)

  // ——— PÁGINA 2: Serviço e Período + carimbo ———
  doc.addPage()
  desenharFundoPagina(doc, pageW, pageH, letterheadBase64)

  const cat = (dados.TIPOS_SERVICO || []).find((c) => c.id === dados.tipoServicoMae)
  const servicoRows = [
    ['Tipo de serviço', cat?.label || '—'],
    ['Serviço selecionado', dados.servicoSelecionado?.nome || '—'],
    ['Data de início', dados.dataInicio],
    ['Data de fim', dados.dataFim],
    ['Período', dados.periodoTexto],
    [
      'Proposta de valor (MZN)',
      dados.valorProposto
        ? Number(dados.valorProposto).toLocaleString('pt-PT')
        : '—'
    ],
    ['Observações', dados.observacoes],
    ['Anexo', dados.anexoNome || '—']
  ]
  y = desenharTabela(doc, 32, 'Serviço e Período', servicoRows, pageW)

  const carimboW = 52
  const carimboH = 42
  const carimboX = pageW - margin - carimboW
  const carimboY = pageH - margin - carimboH - 8
  desenharCarimbo(doc, carimboX, carimboY, carimboW, carimboH, logoBase64)

  return doc
}

export function downloadPdf(doc, id) {
  doc.save(`Cotacao_${id || 'SavilTech'}.pdf`)
}
