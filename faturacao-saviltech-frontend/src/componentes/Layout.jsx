import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useApp } from '../contexto/AppContext'
import './Layout.css'

function Layout() {
  const { sidebarColapsado, coresSistema } = useApp()
  return (
    <div
      className={`layout-dashboard ${sidebarColapsado ? 'sidebar-colapsado' : ''}`}
      style={{
        ['--cor-primaria']: coresSistema.primaria,
        ['--cor-secundaria']: coresSistema.secundaria,
        ['--cor-acento']: coresSistema.acento
      }}
    >
      <Header />
      <Sidebar />
      <main className={`main-dashboard ${sidebarColapsado ? 'sidebar-colapsado' : ''}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default Layout
