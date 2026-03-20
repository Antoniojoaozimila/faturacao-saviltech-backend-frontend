import { useMemo, useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import { generateCotacaoId, saveCotacao } from '../utils/cotacaoStorage'
import { apiCriarCotacaoSimples } from '../services/cotacoesApi'
import { gerarPdfCotacao, downloadPdf } from '../utils/gerarPdfCotacao'
import { logo, papelTimbrado } from '../imagens'
import './CriarCotacoes.css'

const PAISES_COMUNS = [
  'Moçambique',
  'Portugal',
  'Brasil',
  'África do Sul',
  'Angola',
  'Estados Unidos',
  'Reino Unido',
  'China',
  'Índia',
  'França',
  'Alemanha',
  'Espanha',
  'Itália',
  'Países Baixos',
  'Bélgica',
  'Suíça',
  'Áustria',
  'Rússia',
  'Japão',
  'Coreia do Sul',
  'Austrália',
  'Canadá',
  'México',
  'Argentina',
  'Chile',
  'Colômbia',
  'Peru',
  'Venezuela',
  'Equador',
  'Costa do Marfim',
  'Gana',
  'Quénia',
  'Nigéria',
  'Senegal',
  'Tanzânia',
  'Uganda',
  'Zâmbia',
  'Zimbabué',
  'Egito',
  'Marrocos',
  'Argélia',
  'Tunísia',
  'Emirados Árabes Unidos',
  'Arábia Saudita',
  'Israel',
  'Turquia',
  'Indonésia',
  'Tailândia',
  'Malásia',
  'Singapura',
  'Vietname',
  'Filipinas',
  'Paquistão',
  'Bangladesh',
  'Irlanda',
  'Suécia',
  'Noruega',
  'Dinamarca',
  'Finlândia',
  'Polónia',
  'República Checa',
  'Grécia',
  'Roménia',
  'Hungria',
  'Outro'
]

const TIPOS_SERVICO = [
  { id: 'ti', label: 'Tecnologia da Informação' },
  { id: 'dev', label: 'Desenvolvimento & Integração' },
  { id: 'consultoria', label: 'Consultoria & Suporte' }
]

const SERVICOS = [
  // TI
  {
    id: 'suporte-ti',
    categoria: 'ti',
    nome: 'Suporte Técnico & Manutenção',
    resumo: 'Suporte informático presencial e remoto para o seu parque informático.',
    features: [
      'Atendimento Seg-Sex com resposta rápida',
      'Até 5 equipamentos incluídos no plano base',
      'Suporte remoto ilimitado',
      'Visitas presenciais sob pedido',
      'Instalação e atualização de software',
      'Limpeza e otimização de desempenho',
      'Relatório mensal de atividades',
      'Monitorização preventiva de incidentes',
      'Gestão de antivírus e proteção básica',
      'Apoio por email e telefone'
    ]
  },
  {
    id: 'administracao-servidores',
    categoria: 'ti',
    nome: 'Administração de Servidores',
    resumo: 'Gestão completa de servidores físicos e virtuais.',
    features: [
      'Monitorização contínua 24/7',
      'Gestão de utilizadores e permissões',
      'Aplicação de patches e updates de segurança',
      'Configuração de serviços (DNS, DHCP, etc.)',
      'Gestão de backups e recuperação',
      'Virtualização (VMware/Hyper-V)',
      'Relatórios de desempenho e utilização',
      'Gestão de capacidade e crescimento',
      'Plano de continuidade de negócio',
      'Suporte técnico dedicado'
    ]
  },
  {
    id: 'redes-infra',
    categoria: 'ti',
    nome: 'Redes e Infraestrutura',
    resumo: 'Planeamento e implementação de redes LAN, WAN e Wi‑Fi empresariais.',
    features: [
      'Desenho de topologia de rede',
      'LAN, WAN e Wi‑Fi empresarial',
      'Configuração de switches e routers',
      'Cablagem estruturada (ethernet/fibra)',
      'Segmentação por VLANs',
      'Planeamento de cobertura Wi‑Fi',
      'Firewall de rede e regras',
      'Monitorização de tráfego',
      'Documentação técnica da infraestrutura',
      'Manutenção preventiva e corretiva'
    ]
  },
  {
    id: 'seguranca-informatica',
    categoria: 'ti',
    nome: 'Segurança Informática',
    resumo: 'Proteção de dados, acessos e infraestrutura contra ameaças.',
    features: [
      'Firewall e antivírus corporativo',
      'Políticas de acesso e perfis de utilizador',
      'Auditoria de segurança e vulnerabilidades',
      'Deteção de intrusões e alertas',
      'Criptografia de dados sensíveis',
      'Formação em boas práticas de segurança',
      'Planos de resposta a incidentes',
      'Relatórios de conformidade',
      'Monitorização de logs e eventos',
      'Atualizações de segurança contínuas'
    ]
  },
  {
    id: 'backup-recuperacao',
    categoria: 'ti',
    nome: 'Backup & Recuperação de Dados',
    resumo: 'Backups automáticos, encriptados e testados regularmente.',
    features: [
      'Backup automático diário',
      'Retenção configurável (30/90 dias)',
      'Backup local e em nuvem',
      'Criptografia dos backups',
      'Testes de recuperação periódicos',
      'Plano de contingência (Disaster Recovery)',
      'Monitorização de jobs de backup',
      'Relatórios de sucesso/falhas',
      'Restauração de ficheiros e sistemas',
      'Suporte em recuperação de desastres'
    ]
  },
  // Desenvolvimento & Integração
  {
    id: 'websites-responsivos',
    categoria: 'dev',
    nome: 'Criação de Websites Responsivos',
    resumo: 'Sites modernos, rápidos e adaptados a todos os dispositivos.',
    features: [
      'Design responsivo (mobile‑first)',
      'SEO básico incluído',
      'Até 10 páginas de conteúdo',
      'Formulários de contacto integrados',
      'Integração com redes sociais',
      'Certificado SSL e HTTPS',
      'Painel de gestão de conteúdo',
      'Hospedagem opcional',
      'Suporte pós‑lançamento',
      'Manual de utilização para a equipa'
    ]
  },
  {
    id: 'desenvolvimento-software',
    categoria: 'dev',
    nome: 'Desenvolvimento de Software',
    resumo: 'Softwares à medida para gestão, ERP e automação de processos.',
    features: [
      'Análise detalhada de requisitos',
      'Modelação de processos de negócio',
      'Base de dados desenhada para o cliente',
      'Módulos configuráveis por área',
      'Relatórios e dashboards operacionais',
      'Documentação técnica e funcional',
      'Formação de utilizadores finais',
      'Testes e homologação com a equipa',
      'Instalação no ambiente do cliente',
      'Período de garantia e suporte'
    ]
  },
  {
    id: 'aplicativos-web',
    categoria: 'dev',
    nome: 'Aplicativos Web',
    resumo: 'Aplicações web escaláveis, seguras e prontas para crescer.',
    features: [
      'Frontend moderno (SPA ou tradicional)',
      'APIs REST/JSON',
      'Autenticação e perfis de acesso',
      'Base de dados relacional ou NoSQL',
      'Painel administrativo completo',
      'Interface responsiva e acessível',
      'Deploy em servidor ou nuvem',
      'Documentação de API para integrações',
      'Monitorização e logs básicos',
      'Suporte técnico após entrega'
    ]
  },
  {
    id: 'aplicacoes-moveis',
    categoria: 'dev',
    nome: 'Aplicações Móveis com Primavera',
    resumo: 'Apps Android com possível integração ao ERP Primavera.',
    features: [
      'Apps Android nativas ou híbridas',
      'Integração ERP Primavera (quando aplicável)',
      'Sincronização online/offline',
      'Publicação na Play Store',
      'Notificações push personalizadas',
      'Segurança com autenticação segura',
      'Testes em dispositivos reais',
      'Formação da equipa de operação',
      'Manual funcional da aplicação',
      'Atualizações de manutenção planeadas'
    ]
  },
  {
    id: 'chatbots-generativos',
    categoria: 'dev',
    nome: 'Chatbots Generativos',
    resumo: 'Assistentes virtuais com IA para atendimento e automação.',
    features: [
      'Integração com modelos de IA (LLM/API)',
      'Canais Web, WhatsApp e outros',
      'Treino com dados e FAQs do cliente',
      'Respostas em tempo real',
      'Escala para humano quando necessário',
      'Relatórios de conversas e métricas',
      'Integração com CRM e sistemas internos',
      'Ajustes contínuos de qualidade',
      'Políticas de privacidade e segurança',
      'Documentação e formação técnica'
    ]
  },
  {
    id: 'integracao-completa',
    categoria: 'dev',
    nome: 'Integração Completa de Sistemas',
    resumo: 'Integração entre ERP, CRM, Call Center e outros sistemas.',
    features: [
      'Mapeamento de dados entre sistemas',
      'APIs, webhooks e filas de mensagens',
      'Sincronização unidirecional ou bidirecional',
      'Automação de fluxos de trabalho',
      'Gestão de erros e reprocessamentos',
      'Logs detalhados de integrações',
      'Monitorização de saúde das ligações',
      'Documentação técnica para TI interna',
      'Formação da equipa técnica do cliente',
      'Acompanhamento pós‑arranque'
    ]
  },
  // Consultoria & Suporte
  {
    id: 'consultoria-basica',
    categoria: 'consultoria',
    nome: 'Consultoria Básica',
    resumo: 'Sessões de consultoria tecnológica para orientar decisões.',
    features: [
      'Sessão de até 2 horas (online ou presencial)',
      'Levantamento de necessidades e objetivos',
      'Análise do cenário tecnológico atual',
      'Recomendações de ferramentas e soluções',
      'Sugestão de roadmap tecnológico',
      'Entrega de relatório em PDF',
      'Esclarecimento de dúvidas pós‑sessão',
      'Sem obrigação de contratação',
      'Validade do parecer por 30 dias',
      'Possibilidade de sessões recorrentes'
    ]
  },
  {
    id: 'auditoria-analise',
    categoria: 'consultoria',
    nome: 'Auditoria & Análise',
    resumo: 'Auditoria profunda de sistemas, riscos e oportunidades.',
    features: [
      'Análise de infraestrutura de TI',
      'Avaliação de segurança e riscos',
      'Revisão de processos e ferramentas',
      'Mapeamento de pontos críticos',
      'Plano de modernização tecnológica',
      'Priorização de investimentos',
      'Reunião de apresentação executiva',
      'Entrega de relatório técnico',
      'Acompanhamento na implementação',
      'Suporte consultivo temporário'
    ]
  },
  {
    id: 'outsourcing-completo',
    categoria: 'consultoria',
    nome: 'Outsourcing Completo de TI',
    resumo: 'Gestão contínua de TI por equipa especializada SavilTech.',
    features: [
      'Equipa dedicada ou partilhada',
      'Monitorização 24/7',
      'Gestão de servidores e rede',
      'Gestão de backups e segurança',
      'Atendimento a utilizadores finais',
      'Relatórios mensais de atividade',
      'SLA acordado com o cliente',
      'Reuniões periódicas de alinhamento',
      'Gestão de incidentes e problemas',
      'Planeamento de evolução da infraestrutura'
    ]
  },
  {
    id: 'fornecimento-montagem',
    categoria: 'consultoria',
    nome: 'Fornecimento & Montagem de Material Informático',
    resumo: 'Aquisição, instalação e testes de equipamentos de TI.',
    features: [
      'Kits Starlink e internet satélite',
      'Routers, switches e Wi‑Fi empresarial',
      'Cablagem estruturada',
      'Computadores, monitores e periféricos',
      'UPS e proteção elétrica',
      'Montagem e configuração no local',
      'Testes e certificação básica de rede',
      'Integração com infraestrutura existente',
      'Formação básica de utilização',
      'Garantia e suporte pós‑instalação'
    ]
  }
]

const normalizar = (s) => (s || '').toString().trim().toLowerCase()

function calcularPeriodoTexto(dataInicio, dataFim) {
  if (!dataInicio || !dataFim) return ''
  const inicio = new Date(dataInicio)
  const fim = new Date(dataFim)
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime()) || fim < inicio) return ''

  const diffMs = fim.getTime() - inicio.getTime()
  const dias = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1
  const semanas = (dias / 7).toFixed(1)
  return `${dias} dia(s) de desenvolvimento (${semanas} semana(s) aproximadas)`
}

function CriarCotacoes() {
  const location = useLocation()
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt

  const [editMode, setEditMode] = useState(false)
  const [editId, setEditId] = useState(null)

  const [tipoCliente, setTipoCliente] = useState('pessoal')
  const [etapa, setEtapa] = useState(1)

  const [buscaPaisPessoal, setBuscaPaisPessoal] = useState('')
  const [buscaPaisEmpresarial, setBuscaPaisEmpresarial] = useState('')

  const paisesPessoais = useMemo(() => {
    const q = normalizar(buscaPaisPessoal)
    if (!q) return PAISES_COMUNS
    return PAISES_COMUNS.filter((p) => normalizar(p).includes(q))
  }, [buscaPaisPessoal])

  const paisesEmpresariais = useMemo(() => {
    const q = normalizar(buscaPaisEmpresarial)
    if (!q) return PAISES_COMUNS
    return PAISES_COMUNS.filter((p) => normalizar(p).includes(q))
  }, [buscaPaisEmpresarial])

  const [formPessoal, setFormPessoal] = useState({
    saudacao: 'Sr.',
    genero: 'masculino',
    nomeCompleto: '',
    nacionalidade: 'Moçambique',
    dataNascimento: '',
    bi: '',
    telefone: '',
    whatsapp: '',
    email: ''
  })

  const [formEmpresarial, setFormEmpresarial] = useState({
    nacionalidade: 'Moçambique',
    nomeEmpresa: '',
    nuitEmpresa: '',
    setorAtividade: '',
    pessoaContacto: '',
    telefone: '',
    whatsapp: '',
    email: '',
    website: ''
  })

  const [tipoServicoMae, setTipoServicoMae] = useState('ti')
  const [servicoSelecionadoId, setServicoSelecionadoId] = useState(null)
  const servicosVisiveis = useMemo(
    () => SERVICOS.filter((s) => s.categoria === tipoServicoMae),
    [tipoServicoMae]
  )
  const servicoSelecionado = useMemo(
    () => SERVICOS.find((s) => s.id === servicoSelecionadoId) || null,
    [servicoSelecionadoId]
  )

  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const periodoTexto = useMemo(
    () => calcularPeriodoTexto(dataInicio, dataFim),
    [dataInicio, dataFim]
  )

  const [valorProposto, setValorProposto] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [anexoNome, setAnexoNome] = useState('')

  const [erro, setErro] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [cotacaoGerada, setCotacaoGerada] = useState(null)
  const [pdfGerando, setPdfGerando] = useState(false)

  useEffect(() => {
    const ed = location.state?.editCotacao
    if (!ed || !ed.id) {
      setEditMode(false)
      setEditId(null)
      return
    }
    setEditId(ed.id)
    setEditMode(true)
    setTipoCliente(ed.tipoCliente || 'pessoal')
    setFormPessoal({
      saudacao: ed.formPessoal?.saudacao || 'Sr.',
      genero: ed.formPessoal?.genero || 'masculino',
      nomeCompleto: ed.formPessoal?.nomeCompleto || '',
      nacionalidade: ed.formPessoal?.nacionalidade || 'Moçambique',
      dataNascimento: ed.formPessoal?.dataNascimento || '',
      bi: ed.formPessoal?.bi || '',
      telefone: ed.formPessoal?.telefone || '',
      whatsapp: ed.formPessoal?.whatsapp || '',
      email: ed.formPessoal?.email || ''
    })
    setFormEmpresarial({
      nacionalidade: ed.formEmpresarial?.nacionalidade || 'Moçambique',
      nomeEmpresa: ed.formEmpresarial?.nomeEmpresa || '',
      nuitEmpresa: ed.formEmpresarial?.nuitEmpresa || '',
      setorAtividade: ed.formEmpresarial?.setorAtividade || '',
      pessoaContacto: ed.formEmpresarial?.pessoaContacto || '',
      telefone: ed.formEmpresarial?.telefone || '',
      whatsapp: ed.formEmpresarial?.whatsapp || '',
      email: ed.formEmpresarial?.email || '',
      website: ed.formEmpresarial?.website || ''
    })
    setTipoServicoMae(ed.tipoServicoMae || 'ti')
    setServicoSelecionadoId(ed.servicoSelecionado?.id || null)
    setDataInicio(ed.dataInicio || '')
    setDataFim(ed.dataFim || '')
    setValorProposto(ed.valorProposto || '')
    setObservacoes(ed.observacoes || '')
    setAnexoNome(ed.anexoNome || '')
    setEtapa(2)
  }, [location.state?.editCotacao])

  const clienteResumo = useMemo(() => {
    if (tipoCliente === 'pessoal') {
      return {
        tipo: 'Pessoal',
        identificador: formPessoal.nomeCompleto || '—',
        contacto: formPessoal.telefone || formPessoal.whatsapp || formPessoal.email || '—',
        nacionalidade: formPessoal.nacionalidade
      }
    }
    return {
      tipo: 'Empresarial',
      identificador: formEmpresarial.nomeEmpresa || '—',
      contacto:
        formEmpresarial.telefone || formEmpresarial.whatsapp || formEmpresarial.email || '—',
      nacionalidade: formEmpresarial.nacionalidade
    }
  }, [tipoCliente, formPessoal, formEmpresarial])

  const mensagemTexto = useMemo(() => {
    const linhas = []
    linhas.push('Nova cotação criada pelo cliente através do Sistema de Cotação SavilTech.')
    linhas.push('')
    linhas.push('--- Dados do cliente ---')
    linhas.push(`Tipo: ${clienteResumo.tipo}`)
    linhas.push(`Identificação: ${clienteResumo.identificador}`)
    linhas.push(`Nacionalidade: ${clienteResumo.nacionalidade}`)
    if (tipoCliente === 'pessoal') {
      linhas.push(
        `Saudação: ${formPessoal.saudacao} | Género: ${formPessoal.genero || '—'} | Data nasc.: ${
          formPessoal.dataNascimento || '—'
        }`
      )
      linhas.push(`BI: ${formPessoal.bi || '—'}`)
      linhas.push(
        `Telefone: ${formPessoal.telefone || '—'} | WhatsApp: ${
          formPessoal.whatsapp || '—'
        } | Email: ${formPessoal.email || '—'}`
      )
    } else {
      linhas.push(
        `Empresa: ${formEmpresarial.nomeEmpresa || '—'} | NUIT: ${
          formEmpresarial.nuitEmpresa || '—'
        }`
      )
      linhas.push(
        `Setor: ${formEmpresarial.setorAtividade || '—'} | Website: ${
          formEmpresarial.website || '—'
        }`
      )
      linhas.push(
        `Pessoa de contacto: ${formEmpresarial.pessoaContacto || '—'} | Telefone: ${
          formEmpresarial.telefone || '—'
        } | WhatsApp: ${formEmpresarial.whatsapp || '—'} | Email: ${
          formEmpresarial.email || '—'
        }`
      )
    }

    linhas.push('')
    linhas.push('--- Serviço pretendido ---')
    const categoria = TIPOS_SERVICO.find((c) => c.id === tipoServicoMae)
    linhas.push(`Tipo de serviço: ${categoria?.label || '—'}`)
    linhas.push(`Serviço selecionado: ${servicoSelecionado?.nome || '—'}`)
    if (servicoSelecionado) {
      linhas.push(`Resumo: ${servicoSelecionado.resumo}`)
      linhas.push('Principais características:')
      servicoSelecionado.features.slice(0, 6).forEach((f, idx) => {
        linhas.push(`  ${idx + 1}. ${f}`)
      })
    }

    linhas.push('')
    linhas.push('--- Período & orçamento ---')
    linhas.push(`Data de início: ${dataInicio || '—'}`)
    linhas.push(`Data de fim: ${dataFim || '—'}`)
    linhas.push(`Período calculado: ${periodoTexto || '—'}`)
    linhas.push(`Proposta de valor (MZN): ${valorProposto || '—'}`)
    if (anexoNome) {
      linhas.push(`Ficheiro anexado no sistema (não enviado por email): ${anexoNome}`)
    }
    if (observacoes) {
      linhas.push('')
      linhas.push('Observações do cliente:')
      linhas.push(observacoes)
    }

    linhas.push('')
    linhas.push('Mensagem gerada automaticamente. Por favor, contacte o cliente para dar seguimento.')
    return linhas.join('\n')
  }, [
    clienteResumo,
    tipoCliente,
    formPessoal,
    formEmpresarial,
    tipoServicoMae,
    servicoSelecionado,
    dataInicio,
    dataFim,
    periodoTexto,
    valorProposto,
    anexoNome,
    observacoes
  ])

  const mensagemParaEnvio = useMemo(() => {
    const idLine = cotacaoGerada?.id
      ? `ID da cotação: ${cotacaoGerada.id}\n\n`
      : ''
    return idLine + mensagemTexto
  }, [mensagemTexto, cotacaoGerada?.id])

  const mailtoHref = useMemo(() => {
    const assunto = `Cotação ${cotacaoGerada?.id || ''} - Sistema de Cotação`.trim()
    return `mailto:info@saviltech.com?subject=${encodeURIComponent(
      assunto
    )}&body=${encodeURIComponent(mensagemParaEnvio)}`
  }, [mensagemParaEnvio, cotacaoGerada?.id])

  const whatsappHref = useMemo(() => {
    const numero = '258833077953'
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagemParaEnvio)}`
  }, [mensagemParaEnvio])

  const avancarParaEtapa2 = (e) => {
    e.preventDefault()
    if (tipoCliente === 'pessoal') {
      if (!formPessoal.nomeCompleto || !formPessoal.nacionalidade || !formPessoal.telefone) {
        setErro('Preencha pelo menos Nome completo, Nacionalidade e Telefone.')
        return
      }
    } else {
      if (!formEmpresarial.nomeEmpresa || !formEmpresarial.nuitEmpresa || !formEmpresarial.telefone) {
        setErro('Preencha pelo menos Nome da empresa, NUIT e Telefone.')
        return
      }
    }
    setErro('')
    setEtapa(2)
  }

  const gerarCotacao = async (e) => {
    e.preventDefault()
    if (!servicoSelecionadoId) {
      setErro('Selecione um serviço específico antes de gerar a cotação.')
      return
    }
    if (!dataInicio || !dataFim || !periodoTexto) {
      setErro('Selecione as datas de início e fim para calcular o período.')
      return
    }
    if (!valorProposto) {
      setErro('Indique a proposta de valor que pretende pagar.')
      return
    }
    setErro('')
    const id = generateCotacaoId()
    const payload = {
      id,
      tipoCliente,
      formPessoal: { ...formPessoal },
      formEmpresarial: { ...formEmpresarial },
      tipoServicoMae,
      servicoSelecionado: servicoSelecionado ? { ...servicoSelecionado } : null,
      dataInicio,
      dataFim,
      periodoTexto,
      valorProposto,
      observacoes,
      anexoNome,
      TIPOS_SERVICO: [...TIPOS_SERVICO]
    }
    saveCotacao(payload)

    try {
      const clienteNome =
        tipoCliente === 'pessoal'
          ? formPessoal.nomeCompleto || 'Cliente'
          : formEmpresarial.nomeEmpresa || 'Empresa'
      await apiCriarCotacaoSimples({
        numero: id,
        cliente: clienteNome,
        valor: Number(valorProposto),
        estado: 'pendente',
        servico: servicoSelecionado?.nome
      })
    } catch (err) {
      console.error(err)
      setErro('Cotação gerada localmente, mas não foi possível gravar no servidor.')
    }

    setCotacaoGerada({ id, payload })
    setMostrarModal(true)
  }

  const handleDescarregarPdf = async () => {
    if (!cotacaoGerada?.payload) return
    setPdfGerando(true)
    try {
      const doc = await gerarPdfCotacao(cotacaoGerada.payload, logo, papelTimbrado)
      downloadPdf(doc, cotacaoGerada.id)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setPdfGerando(false)
    }
  }

  const handleEnviarEmail = async () => {
    if (!cotacaoGerada?.payload) return
    setPdfGerando(true)
    try {
      const doc = await gerarPdfCotacao(cotacaoGerada.payload, logo, papelTimbrado)
      downloadPdf(doc, cotacaoGerada.id)
      window.open(mailtoHref, '_blank')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setPdfGerando(false)
    }
  }

  const handleEnviarWhatsApp = async () => {
    if (!cotacaoGerada?.payload) return
    setPdfGerando(true)
    try {
      const doc = await gerarPdfCotacao(cotacaoGerada.payload, logo, papelTimbrado)
      downloadPdf(doc, cotacaoGerada.id)
      window.open(whatsappHref, '_blank')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setPdfGerando(false)
    }
  }

  const onUploadChange = (e) => {
    const file = e.target.files?.[0]
    setAnexoNome(file ? file.name : '')
  }

  const renderSeletorPais = (tipo) => {
    const isPessoal = tipo === 'pessoal'
    const busca = isPessoal ? buscaPaisPessoal : buscaPaisEmpresarial
    const setBusca = isPessoal ? setBuscaPaisPessoal : setBuscaPaisEmpresarial
    const lista = isPessoal ? paisesPessoais : paisesEmpresariais
    const valor = isPessoal ? formPessoal.nacionalidade : formEmpresarial.nacionalidade
    const onChangeValor = (novo) => {
      if (isPessoal) setFormPessoal((f) => ({ ...f, nacionalidade: novo }))
      else setFormEmpresarial((f) => ({ ...f, nacionalidade: novo }))
    }

    return (
      <div className="campo-duplo">
        <div className="campo">
          <label htmlFor={`busca-pais-${tipo}`}>Pesquisar país</label>
          <input
            id={`busca-pais-${tipo}`}
            type="text"
            placeholder="Comece a digitar para filtrar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="campo">
          <label htmlFor={`pais-${tipo}`}>Nacionalidade</label>
          <select
            id={`pais-${tipo}`}
            value={valor}
            onChange={(e) => onChangeValor(e.target.value)}
          >
            {lista.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  }

  return (
    <div className="pagina-criar-cotacoes">
      <div className="wizard-header">
        <div className="wizard-etapas">
          <div className={`etapa-item ${etapa >= 1 ? 'ativa' : ''}`}>
            <span className="etapa-num">1</span>
            <span className="etapa-texto">Dados do cliente</span>
          </div>
          <div className={`etapa-item ${etapa >= 2 ? 'ativa' : ''}`}>
            <span className="etapa-num">2</span>
            <span className="etapa-texto">Serviço & período</span>
          </div>
          <div className={`etapa-item ${mostrarModal ? 'ativa' : ''}`}>
            <span className="etapa-num">3</span>
            <span className="etapa-texto">Resumo & envio</span>
          </div>
        </div>
      </div>

      <div className="wizard-layout">
        <div className="wizard-col-principal">
          <div className="seletor-tipo-cliente">
            <button
              type="button"
              className={`btn-tipo ${tipoCliente === 'pessoal' ? 'ativo' : ''}`}
              onClick={() => setTipoCliente('pessoal')}
            >
              <span className="btn-tipo-titulo">Pessoal</span>
              <span className="btn-tipo-sub">Para pessoas singulares</span>
            </button>
            <button
              type="button"
              className={`btn-tipo ${tipoCliente === 'empresarial' ? 'ativo' : ''}`}
              onClick={() => setTipoCliente('empresarial')}
            >
              <span className="btn-tipo-titulo">Empresarial</span>
              <span className="btn-tipo-sub">Para empresas e organizações</span>
            </button>
          </div>

          {erro && <div className="alerta-erro">{erro}</div>}

          <div className={`wizard-cartao wizard-cartao-etapa-${etapa}`}>
            {etapa === 1 && (
              <form
                className={`form-cliente form-cliente-${tipoCliente}`}
                onSubmit={avancarParaEtapa2}
                key={tipoCliente}
              >
                {tipoCliente === 'pessoal' ? (
                  <>
                    <div className="linha-campos">
                      <div className="campo">
                        <label htmlFor="saudacao">Saudação</label>
                        <select
                          id="saudacao"
                          value={formPessoal.saudacao}
                          onChange={(e) =>
                            setFormPessoal((f) => ({ ...f, saudacao: e.target.value }))
                          }
                        >
                          <option value="Sr.">Sr.</option>
                          <option value="Sra.">Sra.</option>
                          <option value="Sr. Dr.">Sr. Dr.</option>
                          <option value="Sra. Dra.">Sra. Dra.</option>
                        </select>
                      </div>
                      <div className="campo">
                        <label htmlFor="genero">Género</label>
                        <select
                          id="genero"
                          value={formPessoal.genero}
                          onChange={(e) =>
                            setFormPessoal((f) => ({ ...f, genero: e.target.value }))
                          }
                        >
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="outro">Outro / Prefiro não dizer</option>
                        </select>
                      </div>
                    </div>

                    <div className="linha-campos">
                      <div className="campo">
                        <label htmlFor="nomeCompleto">
                          Nome completo <span className="obrigatorio">*</span>
                        </label>
                        <input
                          id="nomeCompleto"
                          type="text"
                          value={formPessoal.nomeCompleto}
                          onChange={(e) =>
                            setFormPessoal((f) => ({ ...f, nomeCompleto: e.target.value }))
                          }
                          placeholder="Nome e apelido"
                        />
                      </div>
                    </div>

                    {renderSeletorPais('pessoal')}

                    <div className="linha-campos">
                      <div className="campo">
                        <label htmlFor="dataNascimento">Data de nascimento</label>
                        <input
                          id="dataNascimento"
                          type="date"
                          value={formPessoal.dataNascimento}
                          onChange={(e) =>
                            setFormPessoal((f) => ({ ...f, dataNascimento: e.target.value }))
                          }
                        />
                      </div>
                      <div className="campo">
                        <label htmlFor="bi">B.I / Documento de identificação</label>
                        <input
                          id="bi"
                          type="text"
                          value={formPessoal.bi}
                          onChange={(e) =>
                            setFormPessoal((f) => ({ ...f, bi: e.target.value }))
                          }
                          placeholder="Número de documento"
                        />
                      </div>
                    </div>

                    <div className="linha-campos">
                      <div className="campo">
                        <label htmlFor="telefonePessoal">
                          Telefone principal <span className="obrigatorio">*</span>
                        </label>
                        <input
                          id="telefonePessoal"
                          type="tel"
                          value={formPessoal.telefone}
                          onChange={(e) =>
                            setFormPessoal((f) => ({ ...f, telefone: e.target.value }))
                          }
                          placeholder="+258 ..."
                        />
                      </div>
                      <div className="campo">
                        <label htmlFor="whatsappPessoal">Contacto WhatsApp</label>
                        <input
                          id="whatsappPessoal"
                          type="tel"
                          value={formPessoal.whatsapp}
                          onChange={(e) =>
                            setFormPessoal((f) => ({ ...f, whatsapp: e.target.value }))
                          }
                          placeholder="+258 ..."
                        />
                      </div>
                      <div className="campo">
                        <label htmlFor="emailPessoal">Email</label>
                        <input
                          id="emailPessoal"
                          type="email"
                          value={formPessoal.email}
                          onChange={(e) =>
                            setFormPessoal((f) => ({ ...f, email: e.target.value }))
                          }
                          placeholder="email@exemplo.com"
                        />
                      </div>
                    </div>

                    <div className="barra-acoes">
                      <button type="submit" className="btn-primario">
                        Continuar para seleção de serviço
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {renderSeletorPais('empresarial')}

                    <div className="linha-campos">
                      <div className="campo">
                        <label htmlFor="nomeEmpresa">
                          Nome da empresa <span className="obrigatorio">*</span>
                        </label>
                        <input
                          id="nomeEmpresa"
                          type="text"
                          value={formEmpresarial.nomeEmpresa}
                          onChange={(e) =>
                            setFormEmpresarial((f) => ({ ...f, nomeEmpresa: e.target.value }))
                          }
                          placeholder="Nome comercial / razão social"
                        />
                      </div>
                      <div className="campo">
                        <label htmlFor="nuitEmpresa">
                          NUIT da empresa <span className="obrigatorio">*</span>
                        </label>
                        <input
                          id="nuitEmpresa"
                          type="text"
                          value={formEmpresarial.nuitEmpresa}
                          onChange={(e) =>
                            setFormEmpresarial((f) => ({ ...f, nuitEmpresa: e.target.value }))
                          }
                          placeholder="Número de contribuinte"
                        />
                      </div>
                    </div>

                    <div className="linha-campos">
                      <div className="campo">
                        <label htmlFor="setorAtividade">Setor de atividade</label>
                        <input
                          id="setorAtividade"
                          type="text"
                          value={formEmpresarial.setorAtividade}
                          onChange={(e) =>
                            setFormEmpresarial((f) => ({ ...f, setorAtividade: e.target.value }))
                          }
                          placeholder="Seguros, Educação, Saúde, Indústria..."
                        />
                      </div>
                      <div className="campo">
                        <label htmlFor="websiteEmpresa">Website (se existir)</label>
                        <input
                          id="websiteEmpresa"
                          type="url"
                          value={formEmpresarial.website}
                          onChange={(e) =>
                            setFormEmpresarial((f) => ({ ...f, website: e.target.value }))
                          }
                          placeholder="https://"
                        />
                      </div>
                    </div>

                    <div className="linha-campos">
                      <div className="campo">
                        <label htmlFor="pessoaContacto">Pessoa de contacto</label>
                        <input
                          id="pessoaContacto"
                          type="text"
                          value={formEmpresarial.pessoaContacto}
                          onChange={(e) =>
                            setFormEmpresarial((f) => ({ ...f, pessoaContacto: e.target.value }))
                          }
                          placeholder="Nome da pessoa de referência"
                        />
                      </div>
                    </div>

                    <div className="linha-campos">
                      <div className="campo">
                        <label htmlFor="telefoneEmp">
                          Telefone principal <span className="obrigatorio">*</span>
                        </label>
                        <input
                          id="telefoneEmp"
                          type="tel"
                          value={formEmpresarial.telefone}
                          onChange={(e) =>
                            setFormEmpresarial((f) => ({ ...f, telefone: e.target.value }))
                          }
                          placeholder="+258 ..."
                        />
                      </div>
                      <div className="campo">
                        <label htmlFor="whatsappEmp">Contacto WhatsApp</label>
                        <input
                          id="whatsappEmp"
                          type="tel"
                          value={formEmpresarial.whatsapp}
                          onChange={(e) =>
                            setFormEmpresarial((f) => ({ ...f, whatsapp: e.target.value }))
                          }
                          placeholder="+258 ..."
                        />
                      </div>
                      <div className="campo">
                        <label htmlFor="emailEmp">Email</label>
                        <input
                          id="emailEmp"
                          type="email"
                          value={formEmpresarial.email}
                          onChange={(e) =>
                            setFormEmpresarial((f) => ({ ...f, email: e.target.value }))
                          }
                          placeholder="email@empresa.com"
                        />
                      </div>
                    </div>

                    <div className="barra-acoes">
                      <button type="submit" className="btn-primario">
                        Continuar para seleção de serviço
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}

            {etapa === 2 && (
              <form className="form-servico" onSubmit={gerarCotacao}>
                <div className="linha-campos">
                  <div className="campo">
                    <label>Tipo de serviço</label>
                    <div className="chips-servico-mae">
                      {TIPOS_SERVICO.map((tp) => (
                        <button
                          key={tp.id}
                          type="button"
                          className={`chip-servico ${tipoServicoMae === tp.id ? 'ativo' : ''}`}
                          onClick={() => {
                            setTipoServicoMae(tp.id)
                            setServicoSelecionadoId(null)
                          }}
                        >
                          {tp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grelha-servicos">
                  {servicosVisiveis.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`cartao-servico ${
                        servicoSelecionadoId === s.id ? 'selecionado' : ''
                      }`}
                      onClick={() => setServicoSelecionadoId(s.id)}
                    >
                      <div className="cartao-servico-header">
                        <h3>{s.nome}</h3>
                        <span className="badge-categoria">
                          {TIPOS_SERVICO.find((c) => c.id === s.categoria)?.label}
                        </span>
                      </div>
                      <p className="cartao-servico-resumo">{s.resumo}</p>
                      <ul className="cartao-servico-lista">
                        {s.features.slice(0, 4).map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </div>

                <div className="linha-campos">
                  <div className="campo">
                    <label htmlFor="dataInicio">
                      Data de início <span className="obrigatorio">*</span>
                    </label>
                    <input
                      id="dataInicio"
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="dataFim">
                      Data de fim <span className="obrigatorio">*</span>
                    </label>
                    <input
                      id="dataFim"
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                    />
                  </div>
                  <div className="campo campo-periodo">
                    <label>Período calculado</label>
                    <div className="periodo-box">
                      {periodoTexto || 'Selecione as datas para calcular automaticamente.'}
                    </div>
                  </div>
                </div>

                <div className="linha-campos">
                  <div className="campo">
                    <label htmlFor="valorProposto">
                      Proposta de valor (MZN) <span className="obrigatorio">*</span>
                    </label>
                    <input
                      id="valorProposto"
                      type="number"
                      min={0}
                      step={100}
                      value={valorProposto}
                      onChange={(e) => setValorProposto(e.target.value)}
                      placeholder="Valor que pretende investir"
                    />
                  </div>
                  <div className="campo">
                    <label htmlFor="anexo">Anexar documento (opcional)</label>
                    <input id="anexo" type="file" onChange={onUploadChange} />
                    {anexoNome && <small className="anexo-nome">Selecionado: {anexoNome}</small>}
                  </div>
                </div>

                <div className="linha-campos">
                  <div className="campo campo-textarea">
                    <label htmlFor="observacoes">Observações adicionais</label>
                    <textarea
                      id="observacoes"
                      rows={4}
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Descreva requisitos específicos, integrações desejadas ou notas importantes para a SavilTech."
                    />
                  </div>
                </div>

                <div className="barra-acoes">
                  <button
                    type="button"
                    className="btn-secundario"
                    onClick={() => setEtapa(1)}
                  >
                    Voltar aos dados do cliente
                  </button>
                  <button type="submit" className="btn-primario">
                    {editMode ? t.guardarAlteracoes : t.gerarCotacao}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {mostrarModal && (
        <div className="cotacao-modal-overlay" onClick={() => setMostrarModal(false)}>
          <div className="cotacao-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cotacao-modal-header">
              <h2>Cotação criada com sucesso</h2>
              <button
                type="button"
                className="cotacao-modal-fechar"
                onClick={() => setMostrarModal(false)}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <div className="cotacao-modal-body">
              <p className="cotacao-modal-id">
                <strong>ID:</strong> {cotacaoGerada?.id}
              </p>
              <p className="cotacao-modal-hint">
                Utilize este ID para localizar a cotação em Listar Cotações e Editar Cotações.
              </p>
              <div className="cotacao-modal-acoes">
                <button
                  type="button"
                  className="btn-modal btn-modal-pdf"
                  onClick={handleDescarregarPdf}
                  disabled={pdfGerando}
                >
                  <span className="icone">📄</span>
                  <span>{pdfGerando ? 'A gerar…' : 'Descarregar PDF'}</span>
                </button>
                <button
                  type="button"
                  className="btn-modal email"
                  onClick={handleEnviarEmail}
                  disabled={pdfGerando}
                >
                  <span className="icone">✉</span>
                  <span>Enviar por Email</span>
                </button>
                <button
                  type="button"
                  className="btn-modal whatsapp"
                  onClick={handleEnviarWhatsApp}
                  disabled={pdfGerando}
                >
                  <span className="icone">🟢</span>
                  <span>{t.enviarWhatsApp}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CriarCotacoes
export { SERVICOS, TIPOS_SERVICO }
