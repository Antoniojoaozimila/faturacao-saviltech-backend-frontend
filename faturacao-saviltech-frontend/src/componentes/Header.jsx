import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import './Header.css'

function Header() {
  const { usuario, logout } = useAuth()
  const { idioma, alterarIdioma, toggleSidebar, sidebarColapsado } = useApp()
  const navigate = useNavigate()
  const t = traducoes[idioma] || traducoes.pt

  const [dataHora, setDataHora] = useState(new Date())
  const [menuUserAberto, setMenuUserAberto] = useState(false)
  const [menuMensagensAberto, setMenuMensagensAberto] = useState(false)

  // Mensagens simuladas
  const mensagens = [
    { id: 1, from: 'Cliente A', texto: 'Solicitei uma cotação para seguro auto', lida: false, data: '10:30' },
    { id: 2, from: 'Cliente B', texto: 'Preciso de cotação para imóvel', lida: true, data: '09:15' }
  ]
  const totalNaoLidas = mensagens.filter((m) => !m.lida).length

  useEffect(() => {
    const t = setInterval(() => setDataHora(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const getSaudacao = () => {
    const h = dataHora.getHours()
    if (h < 12) return t.bomDia
    if (h < 18) return t.boaTarde
    return t.boaNoite
  }

  const formatoHora = (d) =>
    d.toLocaleTimeString(idioma === 'pt' ? 'pt-PT' : idioma === 'fr' ? 'fr-FR' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })

  const formatoData = (d) =>
    d.toLocaleDateString(idioma === 'pt' ? 'pt-PT' : idioma === 'fr' ? 'fr-FR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

  return (
    <header className="header-dashboard">
      <div className="header-esq">
        <button
          type="button"
          className="btn-toggle-menu"
          onClick={toggleSidebar}
          aria-label={sidebarColapsado ? 'Abrir menu' : 'Ocultar menu'}
        >
          {sidebarColapsado ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          )}
        </button>

        <div className="header-saudacao">
          <span className="saudacao-texto">{getSaudacao()}, {usuario?.nome || 'Utilizador'}!</span>
          <span className="header-data">{formatoData(dataHora)}</span>
          <span className="header-hora">{formatoHora(dataHora)}</span>
        </div>
      </div>

      <div className="header-centro">
        <div className="header-idiomas">
          {[
            { code: 'pt', flag: '🇵🇹', label: 'Português' },
            { code: 'fr', flag: '🇫🇷', label: 'Français' },
            { code: 'en', flag: '🇺🇸', label: 'English' }
          ].map(({ code, flag, label }) => (
            <button
              key={code}
              type="button"
              className={`btn-idioma ${idioma === code ? 'ativo' : ''}`}
              onClick={() => alterarIdioma(code)}
              title={label}
              aria-label={label}
            >
              {flag}
            </button>
          ))}
        </div>

        <div className="header-acoes">
          <div className="dropdown-mensagens">
            <button
              type="button"
              className="btn-mensagens"
              onClick={() => setMenuMensagensAberto(!menuMensagensAberto)}
              aria-expanded={menuMensagensAberto}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {totalNaoLidas > 0 && <span className="badge-msg">{totalNaoLidas}</span>}
            </button>
            {menuMensagensAberto && (
              <>
                <div className="dropdown-backdrop" onClick={() => setMenuMensagensAberto(false)} />
                <div className="dropdown-panel mensagens-panel mensagens-panel-open">
                  <div className="dropdown-header mensagens-header">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{t.mensagens}</span>
                    {totalNaoLidas > 0 && <span className="badge-header">{totalNaoLidas}</span>}
                  </div>
                  <div className="dropdown-lista">
                    {mensagens.map((m) => (
                      <div key={m.id} className={`msg-item ${!m.lida ? 'nao-lida' : ''}`}>
                        <span className="msg-item-avatar">{m.from.charAt(0)}</span>
                        <div className="msg-item-body">
                          <strong>{m.from}</strong>
                          <p>{m.texto}</p>
                          <small>{m.data}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="btn-ver-mais"
                    onClick={() => { navigate('/mensagens'); setMenuMensagensAberto(false); }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    {t.verMais}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="dropdown-user">
            <button
              type="button"
              className="btn-user"
              onClick={() => setMenuUserAberto(!menuUserAberto)}
              aria-expanded={menuUserAberto}
            >
              {usuario?.imagem ? (
                <img src={usuario.imagem} alt="" className="user-avatar" />
              ) : (
                <span className="user-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
              )}
              <span className="user-nome">{usuario?.nome} {usuario?.apelido}</span>
            </button>
            {menuUserAberto && (
              <>
                <div className="dropdown-backdrop" onClick={() => setMenuUserAberto(false)} />
                <div className="dropdown-panel user-panel">
                  <button type="button" onClick={() => { navigate('/editar-perfil'); setMenuUserAberto(false); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {t.editarPerfil}
                  </button>
                  <button type="button" onClick={() => { navigate('/configuracoes'); setMenuUserAberto(false); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    {t.configuracoes}
                  </button>
                  <hr />
                  <button type="button" onClick={() => { logout(); navigate('/'); setMenuUserAberto(false); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    {t.sair}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
