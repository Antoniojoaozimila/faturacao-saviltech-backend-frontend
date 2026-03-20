import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexto/AuthContext'
import { logo } from '../imagens'
import './Login.css'

const TEXTO_SISTEMA = 'Sistema de Cotação'
const VELOCIDADE_DIGITAR = 120
const PAUSA_FIM = 2000
const VELOCIDADE_APAGAR = 60
const PAUSA_APOS_APAGAR = 500

const EmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const LabelEmailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
    <path d="M3 9l9 6 9-6v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
    <path d="M3 9l9-6 9 6M21 9l-9 6-9-6" />
  </svg>
)

const LabelSenhaIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="label-icon">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
)

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [erro, setErro] = useState('')
  const [submetendo, setSubmetendo] = useState(false)
  const [textoDigitado, setTextoDigitado] = useState('')
  const [estaApagando, setEstaApagando] = useState(false)
  const [indice, setIndice] = useState(0)

  useEffect(() => {
    let delay =
      estaApagando
        ? VELOCIDADE_APAGAR
        : indice === TEXTO_SISTEMA.length
          ? PAUSA_FIM
          : VELOCIDADE_DIGITAR
    if (estaApagando && indice === 0) delay = PAUSA_APOS_APAGAR

    const timeout = setTimeout(() => {
      if (!estaApagando) {
        if (indice < TEXTO_SISTEMA.length) {
          setTextoDigitado(TEXTO_SISTEMA.slice(0, indice + 1))
          setIndice((i) => i + 1)
        } else {
          setEstaApagando(true)
        }
      } else {
        if (indice > 0) {
          const novoIndice = indice - 1
          setIndice(novoIndice)
          setTextoDigitado(TEXTO_SISTEMA.slice(0, novoIndice))
        } else {
          setEstaApagando(false)
        }
      }
    }, delay)
    return () => clearTimeout(timeout)
  }, [indice, estaApagando])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setSubmetendo(true)
    const result = await login(username, password)
    setSubmetendo(false)
    if (result?.ok) navigate('/dashboard')
    else setErro(result?.mensagem || 'Username ou senha incorretos.')
  }

  return (
    <aside className="login-panel">
      <div className="waves-right" aria-hidden="true">
        <svg className="waves-svg" viewBox="0 0 80 100" preserveAspectRatio="none">
          <path className="wave wave1" d="M0 0 L80 0 L80 100 Q40 80 0 100 Z" />
          <path className="wave wave2" d="M0 0 L80 20 Q40 0 0 20 L0 100 L80 100 L80 60 Q40 80 0 60 Z" />
          <path className="wave wave3" d="M0 40 Q40 20 80 40 L80 100 L0 100 Z" />
        </svg>
      </div>

      <div className="particles-bg" aria-hidden="true">
        {[...Array(18)].map((_, i) => (
          <span key={i} className="particle" style={{ '--i': i }} />
        ))}
      </div>

      <div className="login-content">
        <div className="logo-wrap">
          <img src={logo} alt="Logo da empresa" className="logo" />
        </div>
        <h1 className="system-name">
          {textoDigitado}
          <span className="cursor-typewriter" aria-hidden="true">|</span>
        </h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field-label">
            <LabelEmailIcon />
            <span>Username</span>
          </label>
          <div className="input-wrap">
            <span className="input-icon">
              <EmailIcon />
            </span>
            <input
              type="text"
              placeholder="ex: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input"
              autoComplete="username"
            />
          </div>

          <label className="field-label">
            <LabelSenhaIcon />
            <span>Senha</span>
          </label>
          <div className="input-wrap">
            <span className="input-icon">
              <LockIcon />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {erro && <p className="login-erro">{erro}</p>}

          <button type="submit" className="btn-entrar" disabled={submetendo}>
            {submetendo ? 'A entrar…' : 'Entrar'}
          </button>
        </form>

        <hr className="footer-divider" />
        <p className="footer-credit">
          Copyright © 2026 SavilTech Serviços e LDA
        </p>
      </div>
    </aside>
  )
}

export default Login

