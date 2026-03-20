import { useState } from 'react'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import './Suporte.css'

const MENSAGEM_PREDEFINIDA = 'Olá, preciso de suporte no Sistema de Cotação SavilTech.'

const CONTACTOS = [
  { nome: 'Elton', whatsapp: '258841644096', tel: '+258841644096' },
  { nome: 'Antonio', whatsapp: '258845625067', tel: '+258845625067' },
  { nome: 'Octavio', whatsapp: '258848002001', tel: '+258848002001' }
]

const FAQ = [
  {
    pergunta: 'Como criar uma nova cotação?',
    resposta: 'Aceda ao menu "Criar Cotações", preencha os dados do cliente (Pessoal ou Empresarial), avance para a seleção do serviço e período, indique o valor proposto e clique em "Gerar cotação". O PDF pode ser enviado por email ou WhatsApp.'
  },
  {
    pergunta: 'Onde posso ver e editar as cotações guardadas?',
    resposta: 'Em "Listar Cotações" verá todas as cotações em tabela, com filtros e paginação. Em "Editar Cotações" pode pesquisar por ID ou nome e, ao clicar numa cotação, visualizar detalhes, descarregar PDF ou abrir o formulário para editar.'
  },
  {
    pergunta: 'Como emitir uma factura para um cliente?',
    resposta: 'Vá a "Facturação", selecione ou registe o cliente, avance para "Serviço solicitado" e preencha o serviço, período, valor a cobrar e IVA. Pode usar "Distribuição do valor a pagar" para duas fases. Gere o PDF e envie por email ou WhatsApp.'
  },
  {
    pergunta: 'Onde ficam guardadas as facturas?',
    resposta: 'As facturas são guardadas localmente no seu browser. Pode listá-las em "Listar Facturas" e editá-las em "Editar Facturas", com a mesma lógica de pesquisa e formulário que nas cotações.'
  },
  {
    pergunta: 'Como gerar um relatório em PDF?',
    resposta: 'Em "Relatórios" escolha o tipo (Cotações ou Facturas), opcionalmente defina o período (data de início e fim) e clique em "Gerar relatório (PDF)". O documento usa o mesmo template da empresa e inclui o resumo dos registos.'
  },
  {
    pergunta: 'Os meus dados são guardados na nuvem?',
    resposta: 'Não. Cotações e facturas são guardadas apenas no armazenamento local do seu navegador (localStorage). Para não perder dados, exporte relatórios em PDF ou faça cópias de segurança conforme necessário.'
  },
  {
    pergunta: 'Posso alterar o idioma do sistema?',
    resposta: 'Sim. No canto superior da aplicação existe um seletor de idioma (Português, Francês, Inglês). A escolha afeta os textos do menu e das páginas que suportam tradução.'
  },
  {
    pergunta: 'Como contactar a equipa SavilTech?',
    resposta: 'Pode enviar email para info@saviltech.com ou usar o suporte por WhatsApp, telefone e SMS através dos contactos indicados nesta página de Suporte. Escolha o canal que preferir.'
  },
  {
    pergunta: 'O que fazer se o PDF não abrir ou não for gerado?',
    resposta: 'Verifique se o seu navegador permite pop-ups ou descargas para este site. Tente gerar novamente; se o problema continuar, contacte o suporte técnico com o tipo de relatório e período que estava a usar.'
  },
  {
    pergunta: 'Posso usar o sistema em telemóvel?',
    resposta: 'Sim. A interface é responsiva e pode ser usada em smartphones e tablets. Os links de WhatsApp, telefone e SMS nesta página abrem as aplicações nativas do dispositivo quando disponíveis.'
  }
]

function Suporte() {
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt
  const [faqAberto, setFaqAberto] = useState(null)

  const toggleFaq = (idx) => {
    setFaqAberto((prev) => (prev === idx ? null : idx))
  }

  const whatsappUrl = (numero) => `https://wa.me/${numero}?text=${encodeURIComponent(MENSAGEM_PREDEFINIDA)}`
  const smsUrl = (numero) => `sms:${numero}?body=${encodeURIComponent(MENSAGEM_PREDEFINIDA)}`

  return (
    <div className="pagina-suporte">
      <div className="suporte-header suporte-header-btn">
        <h1>{t.suporte}</h1>
        <p>{t.suporteDesc}</p>
      </div>

      <section className="suporte-seccao suporte-faq">
        <h2 className="suporte-titulo-seccao">{t.faqTitulo}</h2>
        <ul className="suporte-lista-faq">
          {(t.faq || FAQ).map((item, idx) => (
            <li key={idx} className={`suporte-item-faq ${faqAberto === idx ? 'aberto' : ''}`}>
              <button
                type="button"
                className="suporte-faq-pergunta"
                onClick={() => toggleFaq(idx)}
                aria-expanded={faqAberto === idx}
              >
                <span>{item.pergunta}</span>
                <span className="suporte-faq-icone">{faqAberto === idx ? '−' : '+'}</span>
              </button>
              <div className="suporte-faq-resposta">
                <p>{item.resposta}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="suporte-seccao suporte-contactos">
        <h2 className="suporte-titulo-seccao">{t.contacteNos}</h2>

        <div className="suporte-card suporte-card-email">
          <div className="suporte-card-icon">✉</div>
          <h3>Email</h3>
          <a href="mailto:info@saviltech.com" className="suporte-link suporte-link-email">
            info@saviltech.com
          </a>
          <p className="suporte-card-desc">{t.emailDesc}</p>
        </div>

        <div className="suporte-whatsapp-group">
          <h3 className="suporte-subtitulo">{t.whatsappSuporte}</h3>
          <p className="suporte-hint">{t.whatsappHint}</p>
          <div className="suporte-contactos-linha">
            {CONTACTOS.map((c) => (
              <a
                key={c.nome}
                href={whatsappUrl(c.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="suporte-chip suporte-chip-whatsapp"
              >
                {c.nome}
              </a>
            ))}
          </div>
        </div>

        <div className="suporte-tel-group">
          <h3 className="suporte-subtitulo">Telefone</h3>
          <p className="suporte-hint">Clique no nome para iniciar uma chamada.</p>
          <div className="suporte-contactos-linha">
            {CONTACTOS.map((c) => (
              <a key={c.nome} href={`tel:${c.tel}`} className="suporte-chip suporte-chip-tel">
                {c.nome}
              </a>
            ))}
          </div>
        </div>

        <div className="suporte-sms-group">
          <h3 className="suporte-subtitulo">{t.sms}</h3>
          <p className="suporte-hint">{t.smsHint}</p>
          <div className="suporte-contactos-linha">
            {CONTACTOS.map((c) => (
              <a key={c.nome} href={smsUrl(c.tel)} className="suporte-chip suporte-chip-sms">
                {c.nome}
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Suporte
