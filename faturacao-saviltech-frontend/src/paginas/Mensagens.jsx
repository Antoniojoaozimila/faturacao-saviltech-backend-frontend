import { useState, useEffect } from 'react'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import { apiListarMensagens, apiResponderMensagem } from '../services/mensagensApi'
import './Mensagens.css'

function formatarData(str) {
  if (!str) return ''
  const d = new Date(str)
  return d.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Mensagens() {
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt
  const [mensagens, setMensagens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [aberta, setAberta] = useState(null)
  const [resposta, setResposta] = useState('')
  const [enviando, setEnviando] = useState(null)

  useEffect(() => {
    let cancel = false
    async function carregar() {
      setCarregando(true)
      setErro(null)
      try {
        const lista = await apiListarMensagens()
        if (!cancel) setMensagens(lista)
      } catch (e) {
        if (!cancel) setErro(e.message || 'Erro ao carregar mensagens.')
      } finally {
        if (!cancel) setCarregando(false)
      }
    }
    carregar()
    return () => { cancel = true }
  }, [])

  const enviar = async (id) => {
    if (!resposta.trim()) return
    setEnviando(id)
    try {
      await apiResponderMensagem(id, resposta.trim())
      setMensagens((m) => m.map((msg) => (msg.id === Number(id) ? { ...msg, resposta: resposta.trim() } : msg)))
      setResposta('')
      setAberta(null)
    } catch (e) {
      setErro(e.message || 'Erro ao enviar resposta.')
    } finally {
      setEnviando(null)
    }
  }

  return (
    <div className="pagina-mensagens">
      <h1>{t.mensagens}</h1>
      <p>{t.responderMensagens}</p>
      {carregando && <p className="msg-carregando">A carregar mensagens...</p>}
      {erro && <p className="msg-erro">{erro}</p>}
      {!carregando && !erro && mensagens.length === 0 && (
        <p className="msg-vazio">Nenhuma mensagem recebida.</p>
      )}
      <div className="lista-mensagens">
        {mensagens.map((m) => (
          <div key={m.id} className={`msg-card ${m.lida ? 'msg-lida' : ''}`}>
            <div className="msg-cabecalho">
              <strong>{m.nome_cliente}</strong>
              <span title={m.email}>{m.email}</span>
              <span className="msg-data">{formatarData(m.data_criacao)}</span>
            </div>
            {m.assunto && <p className="msg-assunto"><strong>Assunto:</strong> {m.assunto}</p>}
            <p className="msg-texto">{m.mensagem}</p>
            {aberta === m.id ? (
              <div className="msg-responder">
                <textarea value={resposta} onChange={(e) => setResposta(e.target.value)} placeholder="Resposta..." rows={3} />
                <button type="button" onClick={() => enviar(m.id)} disabled={enviando === m.id}>
                  {enviando === m.id ? 'A enviar...' : 'Enviar'}
                </button>
                <button type="button" onClick={() => setAberta(null)} disabled={!!enviando}>Cancelar</button>
              </div>
            ) : (
              !m.resposta && <button type="button" className="btn-responder" onClick={() => setAberta(m.id)}>Responder</button>
            )}
            {m.resposta && <div className="msg-resposta"><strong>{t.resposta}:</strong> {m.resposta}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Mensagens
