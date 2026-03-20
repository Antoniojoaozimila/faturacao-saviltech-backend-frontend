import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexto/AuthContext'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import { ForcaSenha } from '../componentes/ForcaSenha'
import { apiAtualizarPerfil } from '../services/perfilApi'
import './EditarPerfil.css'

const IconUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)
const IconSave = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)
const IconImage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

function EditarPerfil() {
  const { usuario, atualizarUsuario } = useAuth()
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt
  const [nome, setNome] = useState(usuario?.nome || '')
  const [apelido, setApelido] = useState(usuario?.apelido || '')
  const [username, setUsername] = useState(usuario?.username || '')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [previewImagem, setPreviewImagem] = useState(usuario?.imagem || null)
  const [imagemBase64, setImagemBase64] = useState(usuario?.imagem || null)
  const [guardando, setGuardando] = useState(false)
  const [erroPerfil, setErroPerfil] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    setPreviewImagem(usuario?.imagem || null)
    setImagemBase64(usuario?.imagem || null)
  }, [usuario?.imagem])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setPreviewImagem(url)
    const reader = new FileReader()
    reader.onloadend = () => setImagemBase64(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErroPerfil(null)
    setGuardando(true)
    try {
      const payload = {
        nome: nome.trim(),
        apelido: apelido.trim(),
        username: username.trim(),
        ...(imagemBase64 && { imagem: imagemBase64 }),
        ...(novaSenha && { senhaAtual, novaSenha }),
      }
      const usuarioAtualizado = await apiAtualizarPerfil(payload)
      atualizarUsuario(usuarioAtualizado)
      if (novaSenha) setNovaSenha('')
      if (senhaAtual) setSenhaAtual('')
    } catch (err) {
      setErroPerfil(err.message || 'Erro ao guardar perfil.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="pagina-editar-perfil">
      <h1 className="editar-perfil-titulo">{t.editarPerfil}</h1>
      <p className="editar-perfil-sub">{t.atualizeDados}</p>

      {erroPerfil && <p className="form-erro">{erroPerfil}</p>}
      <form onSubmit={handleSubmit} className="form-perfil">
          <div className="form-grupo-imagem">
            <label className="label-imagem">
              <span className="label-imagem-icon"><IconImage /></span>
              {t.fotoPerfil}
            </label>
            <div className="imagem-upload-area">
              <div className="preview-wrap">
                {previewImagem ? (
                  <img src={previewImagem} alt="Preview" className="preview-imagem" />
                ) : (
                  <span className="preview-placeholder">
                    <IconUser />
                    <span>{t.semImagem}</span>
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="input-file-hidden"
                id="foto-perfil"
              />
              <label htmlFor="foto-perfil" className="btn-escolher-foto">{t.carregarImagem}</label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-grupo">
              <label className="form-label"><IconUser /> {t.primeiroNome}</label>
              <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder={t.placeholderNome} required className="form-input" />
            </div>
            <div className="form-grupo">
              <label className="form-label"><IconUser /> {t.apelido}</label>
              <input type="text" value={apelido} onChange={(e) => setApelido(e.target.value)} placeholder={t.placeholderApelido} required className="form-input" />
            </div>
          </div>

          <div className="form-grupo">
            <label className="form-label"><IconUser /> {t.username}</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t.placeholderUsername} required className="form-input" />
          </div>

          <div className="form-divider" />
          <p className="form-secao-titulo">{t.alterarSenhaOpc}</p>

          <div className="form-grupo">
            <label className="form-label"><IconLock /> {t.senhaAtual}</label>
            <input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} placeholder="••••••••" className="form-input" />
          </div>
          <div className="form-grupo">
            <label className="form-label"><IconLock /> {t.novaSenha}</label>
            <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="••••••••" className="form-input" />
            <ForcaSenha valor={novaSenha} />
          </div>

          <div className="form-acoes">
            <button type="submit" className="btn-guardar" disabled={guardando}>
              <IconSave /> {guardando ? 'A guardar...' : t.guardar}
            </button>
          </div>
        </form>
    </div>
  )
}

export default EditarPerfil
