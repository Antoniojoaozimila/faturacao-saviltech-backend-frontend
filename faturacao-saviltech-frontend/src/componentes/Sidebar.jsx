import { NavLink } from 'react-router-dom'
import { useApp } from '../contexto/AppContext'
import { useAuth } from '../contexto/AuthContext'
import { traducoes } from '../contexto/traducoes'
import { logo } from '../imagens'
import './Sidebar.css'

const menusCompletos = [
  { path: '/dashboard', icon: 'dashboard', chave: 'dashboard', adminOnly: false },
  { path: '/criar-cotacoes', icon: 'criar', chave: 'criarCotacoes', adminOnly: false },
  { path: '/editar-cotacoes', icon: 'editar', chave: 'editarCotacoes', adminOnly: false },
  { path: '/listar-cotacoes', icon: 'listar', chave: 'listarCotacoes', adminOnly: false },
  { type: 'divider', label: 'VD' },
  { path: '/facturacao', icon: 'facturacao', chave: 'facturacao', adminOnly: true },
  { path: '/listar-facturas', icon: 'listar', chave: 'listarFacturas', adminOnly: false },
  { path: '/editar-facturas', icon: 'editar', chave: 'editarFacturas', adminOnly: true },
  { path: '/relatorios', icon: 'relatorios', chave: 'relatorios', adminOnly: true },
  { path: '/suporte', icon: 'suporte', chave: 'suporte', adminOnly: false },
  { path: '/configuracoes', icon: 'editar', chave: 'configuracoes', adminOnly: true }
]

const Icone = ({ nome }) => {
  const svgs = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></>,
    criar: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
    editar: <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    listar: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    facturacao: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></>,
    relatorios: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>,
    suporte: <><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></>
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{svgs[nome]}</svg>
}

function Sidebar() {
  const { idioma, sidebarColapsado } = useApp()
  const { usuario } = useAuth()
  const t = traducoes[idioma] || traducoes.pt
  const isAdmin = !!usuario?.admin
  const menus = menusCompletos.filter((m) => m.type === 'divider' || !m.adminOnly || isAdmin)

  return (
    <aside className={`sidebar-dashboard ${sidebarColapsado ? 'colapsado' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={logo} alt="Logo" />
        </div>
        {!sidebarColapsado && <span className="logo-text">Sistema de Cotação</span>}
      </div>

      <hr className="sidebar-divider" />

      <nav className="sidebar-nav">
        {menus.map((m, i) =>
          m.type === 'divider' ? (
            <div key={`div-${i}`} className="sidebar-divider-vd">
              <hr className="sidebar-hr-vd" />
              <span className="sidebar-vd-label">{m.label}</span>
              <hr className="sidebar-hr-vd" />
            </div>
          ) : (
            <NavLink
              key={m.path}
              to={m.path}
              className={({ isActive }) => `nav-item ${isActive ? 'ativo' : ''}`}
              title={sidebarColapsado ? t[m.chave] : ''}
            >
              <span className="nav-icon"><Icone nome={m.icon} /></span>
              {!sidebarColapsado && <span className="nav-text">{t[m.chave]}</span>}
              {sidebarColapsado && <span className="nav-tooltip">{t[m.chave]}</span>}
            </NavLink>
          )
        )}
      </nav>

      <hr className="sidebar-divider" />

      <div className="sidebar-version" title={t.versao}>
        {sidebarColapsado ? <span>1.0</span> : <span>{t.versao}</span>}
        {sidebarColapsado && <span className="nav-tooltip">{t.versao}</span>}
      </div>
    </aside>
  )
}

export default Sidebar
