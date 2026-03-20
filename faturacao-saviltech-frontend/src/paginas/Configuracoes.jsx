import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexto/AuthContext'
import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import { ForcaSenha } from '../componentes/ForcaSenha'
import { apiCriarUsuario, apiListarUsuarios, apiAtualizarUsuario } from '../services/usuariosApi'
import './Configuracoes.css'

const IconPalette = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <circle cx="13.5" cy="6.5" r="0.5" />
    <circle cx="17.5" cy="10.5" r="0.5" />
    <circle cx="8.5" cy="7.5" r="0.5" />
    <circle cx="6.5" cy="12.5" r="0.5" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.75-.14 2.53-.38" />
  </svg>
)
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
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
const IconImage = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)
const IconAddUser = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
)
const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const IconEye = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

const LIMITE_POR_PAGINA = 5

function Configuracoes() {
  const { usuario } = useAuth()
  const { coresSistema, alterarCores, idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt
  const [primaria, setPrimaria] = useState(coresSistema.primaria)
  const [secundaria, setSecundaria] = useState(coresSistema.secundaria)
  const [aplicado, setAplicado] = useState(false)
  const [criarNome, setCriarNome] = useState('')
  const [criarApelido, setCriarApelido] = useState('')
  const [criarUsername, setCriarUsername] = useState('')
  const [criarSenha, setCriarSenha] = useState('')
  const [criarNivel, setCriarNivel] = useState('user')
  const [criarPreview, setCriarPreview] = useState(null)
  const [criarImagemBase64, setCriarImagemBase64] = useState(null)
  const [criadoMsg, setCriadoMsg] = useState('')
  const [criando, setCriando] = useState(false)
  const [criarErro, setCriarErro] = useState('')
  const [mostrarSenhaCriar, setMostrarSenhaCriar] = useState(false)
  const fileCriarRef = useRef(null)

  const [utilizadores, setUtilizadores] = useState([])
  const [totalUtilizadores, setTotalUtilizadores] = useState(0)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [filtroUtilizadores, setFiltroUtilizadores] = useState('')
  const [carregandoLista, setCarregandoLista] = useState(true)
  const [erroLista, setErroLista] = useState(null)

  const [editandoId, setEditandoId] = useState(null)
  const [editNome, setEditNome] = useState('')
  const [editApelido, setEditApelido] = useState('')
  const [editUsername, setEditUsername] = useState('')
  const [editAdmin, setEditAdmin] = useState(false)
  const [editNovaSenha, setEditNovaSenha] = useState('')
  const [editImagem, setEditImagem] = useState(null)
  const [editPreview, setEditPreview] = useState(null)
  const [guardandoEdit, setGuardandoEdit] = useState(false)
  const [erroEdit, setErroEdit] = useState('')
  const fileEditRef = useRef(null)

  const totalPaginas = Math.max(1, Math.ceil(totalUtilizadores / LIMITE_POR_PAGINA))

  useEffect(() => {
    let cancel = false
    async function carregar() {
      setCarregandoLista(true)
      setErroLista(null)
      try {
        const data = await apiListarUsuarios({ page: paginaAtual, limit: LIMITE_POR_PAGINA, q: filtroUtilizadores.trim() })
        if (!cancel) {
          setUtilizadores(data.utilizadores || [])
          setTotalUtilizadores(data.total ?? 0)
        }
      } catch (e) {
        if (!cancel) setErroLista(e.message || 'Erro ao carregar utilizadores.')
      } finally {
        if (!cancel) setCarregandoLista(false)
      }
    }
    carregar()
    return () => { cancel = true }
  }, [paginaAtual, filtroUtilizadores])

  const aplicarCores = () => {
    alterarCores({ primaria, secundaria, acento: secundaria })
    setAplicado(true)
    setTimeout(() => setAplicado(false), 2000)
  }

  const handleCriarFoto = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setCriarPreview(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onloadend = () => setCriarImagemBase64(reader.result)
    reader.readAsDataURL(file)
  }

  const handleCriarUsuario = async (e) => {
    e.preventDefault()
    setCriarErro('')
    if (!criarNome.trim() || !criarApelido.trim() || !criarUsername.trim() || !criarSenha) {
      setCriadoMsg('preenchaCampos')
      return
    }
    setCriando(true)
    try {
      await apiCriarUsuario({
        nome: criarNome.trim(),
        apelido: criarApelido.trim(),
        username: criarUsername.trim().toLowerCase(),
        senha: criarSenha,
        admin: criarNivel === 'admin',
        imagem: criarImagemBase64 || null
      })
      setCriarNome('')
      setCriarApelido('')
      setCriarUsername('')
      setCriarSenha('')
      setCriarNivel('user')
      setCriarPreview(null)
      setCriarImagemBase64(null)
      setCriadoMsg('utilizadorCriado')
      const data = await apiListarUsuarios({ page: 1, limit: LIMITE_POR_PAGINA, q: filtroUtilizadores.trim() })
      setUtilizadores(data.utilizadores || [])
      setTotalUtilizadores(data.total ?? 0)
      setPaginaAtual(1)
      if (fileCriarRef.current) fileCriarRef.current.value = ''
    } catch (err) {
      setCriarErro(err.message || 'Erro ao criar utilizador.')
      setCriadoMsg('')
    } finally {
      setCriando(false)
    }
  }

  const abrirEditar = (u) => {
    setEditandoId(u.id)
    setEditNome(u.nome || '')
    setEditApelido(u.apelido || '')
    setEditUsername(u.username || '')
    setEditAdmin(!!u.admin)
    setEditNovaSenha('')
    setEditImagem(u.imagem || null)
    setEditPreview(u.imagem || null)
    setErroEdit('')
    if (fileEditRef.current) fileEditRef.current.value = ''
  }

  const handleEditFoto = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setEditPreview(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onloadend = () => setEditImagem(reader.result)
    reader.readAsDataURL(file)
  }

  const fecharEditar = () => {
    setEditandoId(null)
    setErroEdit('')
  }

  const guardarEditar = async (e) => {
    e.preventDefault()
    if (!editandoId) return
    setErroEdit('')
    setGuardandoEdit(true)
    try {
      await apiAtualizarUsuario(editandoId, {
        nome: editNome.trim(),
        apelido: editApelido.trim(),
        username: editUsername.trim().toLowerCase(),
        admin: editAdmin,
        ...(editNovaSenha && { novaSenha: editNovaSenha }),
        ...(editImagem !== undefined && editImagem !== null && { imagem: editImagem })
      })
      const data = await apiListarUsuarios({ page: paginaAtual, limit: LIMITE_POR_PAGINA, q: filtroUtilizadores.trim() })
      setUtilizadores(data.utilizadores || [])
      setTotalUtilizadores(data.total ?? 0)
      fecharEditar()
    } catch (err) {
      setErroEdit(err.message || 'Erro ao atualizar.')
    } finally {
      setGuardandoEdit(false)
    }
  }

  return (
    <div className="pagina-configuracoes">
      <h1 className="config-titulo">{t.configuracoes}</h1>
      <p className="config-desc">{t.personalizarSistema}</p>

      <section className="config-card">
        <div className="config-card-header">
          <span className="config-card-icon config-card-icon-cores"><IconPalette /></span>
          <h2>{t.coresSistema}</h2>
        </div>
        <p className="config-card-desc">{t.altereCores}</p>
        <div className="config-cores">
          <div className="config-cor-item">
            <label>{t.corPrimaria}</label>
            <div className="config-cor-input-wrap">
              <input type="color" value={primaria} onChange={(e) => setPrimaria(e.target.value)} className="config-color" />
              <span className="config-cor-hex">{primaria}</span>
            </div>
          </div>
          <div className="config-cor-item">
            <label>{t.corSecundaria}</label>
            <div className="config-cor-input-wrap">
              <input type="color" value={secundaria} onChange={(e) => setSecundaria(e.target.value)} className="config-color" />
              <span className="config-cor-hex">{secundaria}</span>
            </div>
          </div>
          <button type="button" onClick={aplicarCores} className={`btn-aplicar-cores ${aplicado ? 'aplicado' : ''}`}>
            <IconCheck />
            {aplicado ? 'Aplicado!' : 'Aplicar cores'}
          </button>
        </div>
      </section>

      {usuario?.admin && (
        <section className="config-card">
          <div className="config-card-header">
            <span className="config-card-icon config-card-icon-permissoes"><IconShield /></span>
            <h2>{t.permissoes}</h2>
          </div>
          <p className="config-card-desc">{t.criarUtilizadorDesc}</p>
          <form onSubmit={handleCriarUsuario} className="form-criar-usuario">
            <div className="form-criar-row">
              <div className="form-criar-grupo">
                <label className="form-criar-label"><IconUser /> {t.primeiroNome}</label>
                <input type="text" value={criarNome} onChange={(e) => setCriarNome(e.target.value)} placeholder={t.primeiroNome} required className="form-criar-input" />
              </div>
              <div className="form-criar-grupo">
                <label className="form-criar-label"><IconUser /> {t.apelido}</label>
                <input type="text" value={criarApelido} onChange={(e) => setCriarApelido(e.target.value)} placeholder={t.apelido} required className="form-criar-input" />
              </div>
            </div>
            <div className="form-criar-grupo">
              <label className="form-criar-label"><IconUser /> {t.username}</label>
              <input type="text" value={criarUsername} onChange={(e) => setCriarUsername(e.target.value)} placeholder="nome.utilizador" required className="form-criar-input" />
            </div>
            <div className="form-criar-grupo">
              <label className="form-criar-label"><IconImage /> Foto de perfil</label>
              <div className="form-criar-foto">
                <div className="form-criar-preview">
                  {criarPreview ? <img src={criarPreview} alt="Preview" /> : <span><IconUser /> Sem imagem</span>}
                </div>
                <input ref={fileCriarRef} type="file" accept="image/*" onChange={handleCriarFoto} id="criar-foto" className="input-file-hidden" />
                <label htmlFor="criar-foto" className="btn-criar-foto">Carregar imagem</label>
              </div>
            </div>
            <div className="form-criar-grupo">
              <label className="form-criar-label"><IconLock /> {t.senha}</label>
              <div className="form-senha-wrap">
                <input
                  type={mostrarSenhaCriar ? 'text' : 'password'}
                  value={criarSenha}
                  onChange={(e) => setCriarSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="form-criar-input"
                />
                <button type="button" className="btn-toggle-senha" onClick={() => setMostrarSenhaCriar((v) => !v)} title={mostrarSenhaCriar ? 'Ocultar senha' : 'Ver senha'} aria-label={mostrarSenhaCriar ? 'Ocultar senha' : 'Ver senha'}>
                  {mostrarSenhaCriar ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              <ForcaSenha valor={criarSenha} />
            </div>
            <div className="form-criar-grupo">
              <label className="form-criar-label"><IconShield /> Nível de permissão</label>
              <select value={criarNivel} onChange={(e) => setCriarNivel(e.target.value)} className="form-criar-select">
                <option value="user">Utilizador final</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            {criarErro && <p className="form-criar-msg erro">{criarErro}</p>}
            {criadoMsg && !criarErro && <p className={`form-criar-msg ${criadoMsg === 'utilizadorCriado' ? 'sucesso' : 'erro'}`}>{t[criadoMsg]}</p>}
            <button type="submit" className="btn-criar-usuario" disabled={criando}>
              <IconAddUser /> {criando ? 'A criar...' : t.criarUtilizador}
            </button>
          </form>

          <div className="config-tabela-utilizadores">
            <h3 className="config-tabela-titulo">Lista de utilizadores</h3>
            <div className="config-tabela-filtro">
              <input
                type="text"
                placeholder="Pesquisar por nome ou username..."
                value={filtroUtilizadores}
                onChange={(e) => { setFiltroUtilizadores(e.target.value); setPaginaAtual(1) }}
                className="config-filtro-input"
              />
            </div>
            {carregandoLista && <p className="config-tabela-carregando">A carregar...</p>}
            {erroLista && <p className="config-tabela-erro">{erroLista}</p>}
            {!carregandoLista && !erroLista && (
              <>
                <div className="config-tabela-wrap">
                  <table className="config-tabela">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Nome</th>
                        <th>Apelido</th>
                        <th>Username</th>
                        <th>Permissão</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {utilizadores.map((u) => (
                        <tr key={u.id}>
                          <td>{u.id}</td>
                          <td>{u.nome}</td>
                          <td>{u.apelido}</td>
                          <td>{u.username}</td>
                          <td><span className={`config-badge ${u.admin ? 'admin' : 'user'}`}>{u.admin ? 'Administrador' : 'Utilizador final'}</span></td>
                          <td>
                            <button type="button" className="btn-editar-user" onClick={() => abrirEditar(u)} title="Editar">
                              <IconEdit />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalPaginas > 1 && (
                  <div className="config-paginacao">
                    <button type="button" disabled={paginaAtual <= 1} onClick={() => setPaginaAtual((p) => p - 1)}>Anterior</button>
                    <span className="config-pagina-info">Página {paginaAtual} de {totalPaginas} ({totalUtilizadores} total)</span>
                    <button type="button" disabled={paginaAtual >= totalPaginas} onClick={() => setPaginaAtual((p) => p + 1)}>Próxima</button>
                  </div>
                )}
              </>
            )}
          </div>

          {editandoId && (
            <div className="config-modal-overlay" onClick={fecharEditar}>
              <div className="config-modal" onClick={(e) => e.stopPropagation()}>
                <h3>Editar utilizador</h3>
                <form onSubmit={guardarEditar} className="form-editar-usuario">
                  <div className="form-criar-row">
                    <div className="form-criar-grupo">
                      <label>Nome</label>
                      <input type="text" value={editNome} onChange={(e) => setEditNome(e.target.value)} required className="form-criar-input" />
                    </div>
                    <div className="form-criar-grupo">
                      <label>Apelido</label>
                      <input type="text" value={editApelido} onChange={(e) => setEditApelido(e.target.value)} required className="form-criar-input" />
                    </div>
                  </div>
                  <div className="form-criar-grupo">
                    <label>Username</label>
                    <input type="text" value={editUsername} onChange={(e) => setEditUsername(e.target.value)} required className="form-criar-input" />
                  </div>
                  <div className="form-criar-grupo">
                    <label>Nível de permissão</label>
                    <select value={editAdmin ? 'admin' : 'user'} onChange={(e) => setEditAdmin(e.target.value === 'admin')} className="form-criar-select">
                      <option value="user">Utilizador final</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="form-criar-grupo">
                    <label>Nova senha (opcional)</label>
                    <div className="form-senha-wrap">
                      <input
                        type={mostrarSenhaEdit ? 'text' : 'password'}
                        value={editNovaSenha}
                        onChange={(e) => setEditNovaSenha(e.target.value)}
                        placeholder="Deixar em branco para manter"
                        className="form-criar-input"
                      />
                      <button type="button" className="btn-toggle-senha" onClick={() => setMostrarSenhaEdit((v) => !v)} title={mostrarSenhaEdit ? 'Ocultar senha' : 'Ver senha'} aria-label={mostrarSenhaEdit ? 'Ocultar senha' : 'Ver senha'}>
                        {mostrarSenhaEdit ? <IconEyeOff /> : <IconEye />}
                      </button>
                    </div>
                    {editNovaSenha && <ForcaSenha valor={editNovaSenha} />}
                  </div>
                  <div className="form-criar-grupo">
                    <label>Foto de perfil</label>
                    <div className="form-criar-foto">
                      <div className="form-criar-preview">
                        {editPreview ? <img src={editPreview} alt="Preview" /> : <span><IconUser /> Sem imagem</span>}
                      </div>
                      <input ref={fileEditRef} type="file" accept="image/*" onChange={handleEditFoto} id="edit-foto" className="input-file-hidden" />
                      <label htmlFor="edit-foto" className="btn-criar-foto">Alterar imagem</label>
                    </div>
                  </div>
                  {erroEdit && <p className="form-criar-msg erro">{erroEdit}</p>}
                  <div className="config-modal-acoes">
                    <button type="button" onClick={fecharEditar} className="btn-cancelar">Cancelar</button>
                    <button type="submit" className="btn-guardar-edit" disabled={guardandoEdit}>{guardandoEdit ? 'A guardar...' : 'Guardar'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default Configuracoes
