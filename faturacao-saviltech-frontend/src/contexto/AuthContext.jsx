import { createContext, useContext, useState, useEffect } from 'react'
import { API_BASE, getAuthHeaders } from '../config/api'

const STORAGE_TOKEN = 'sistema_cotacao_token'
const STORAGE_USER = 'sistema_cotacao_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [autenticado, setAutenticado] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [usuariosCriados, setUsuariosCriados] = useState([])

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN)
    const userJson = localStorage.getItem(STORAGE_USER)
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson)
        setUsuario(user)
        setAutenticado(true)
      } catch (_) {
        localStorage.removeItem(STORAGE_TOKEN)
        localStorage.removeItem(STORAGE_USER)
      }
    }
    setCarregando(false)
  }, [])

  const login = async (username, senha) => {
    const user = (username || '').trim()
    if (!user || !senha) {
      return { ok: false, mensagem: 'Username e senha são obrigatórios.' }
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, senha }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { ok: false, mensagem: data.mensagem || 'Credenciais inválidas.' }
      }
      const { token, usuario: u } = data
      if (!token || !u) {
        return { ok: false, mensagem: 'Resposta inválida do servidor.' }
      }
      localStorage.setItem(STORAGE_TOKEN, token)
      localStorage.setItem(STORAGE_USER, JSON.stringify(u))
      setUsuario(u)
      setAutenticado(true)
      return { ok: true }
    } catch (err) {
      console.error(err)
      return {
        ok: false,
        mensagem: 'Não foi possível contactar o servidor. Verifica se o backend está a correr.',
      }
    }
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN)
    localStorage.removeItem(STORAGE_USER)
    setUsuario(null)
    setAutenticado(false)
  }

  const atualizarUsuario = (dados) => {
    setUsuario((u) => {
      if (!u) return u
      const next = { ...u, ...dados }
      localStorage.setItem(STORAGE_USER, JSON.stringify(next))
      return next
    })
  }

  const criarUsuario = (dados) => {
    const novo = {
      nome: dados.nome,
      apelido: dados.apelido,
      username: dados.username?.trim().toLowerCase(),
      senha: dados.senha,
      admin: dados.admin === true,
      imagem: dados.imagem || null,
    }
    setUsuariosCriados((prev) => [...prev, novo])
    return true
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado,
        carregando,
        login,
        logout,
        atualizarUsuario,
        criarUsuario,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
