import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexto/AuthContext'
import Login from './paginas/Login'
import Layout from './componentes/Layout'
import Dashboard from './paginas/Dashboard'
import EditarPerfil from './paginas/EditarPerfil'
import Configuracoes from './paginas/Configuracoes'
import Mensagens from './paginas/Mensagens'
import CriarCotacoes from './paginas/CriarCotacoes'
import EditarCotacoes from './paginas/EditarCotacoes'
import ListarCotacoes from './paginas/ListarCotacoes'
import Facturacao from './paginas/Facturacao'
import FacturacaoServico from './paginas/FacturacaoServico'
import ListarFacturas from './paginas/ListarFacturas'
import EditarFacturas from './paginas/EditarFacturas'
import Relatorios from './paginas/Relatorios'
import Suporte from './paginas/Suporte'
import './App.css'

const MAP_EMBED_URL = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3587.350869953849!2d32.59289837507342!3d-25.956530753932228!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ee69bb33c3c2efd%3A0x4ae08f7c83468c8e!2sImperial%20Seguros!5e0!3m2!1spt-PT!2smz!4v1772748109426!5m2!1spt-PT!2smz'

function PaginaLogin() {
  const { autenticado, carregando } = useAuth()
  if (carregando) return <div className="app-loading">A carregar…</div>
  if (autenticado) return <Navigate to="/dashboard" replace />
  return (
    <div className="login-page">
      <Login />
      <section className="map-section" aria-label="Localização no mapa">
        <iframe src={MAP_EMBED_URL} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Localização - Imperial Seguros" />
      </section>
    </div>
  )
}

function Protegida({ children }) {
  const { autenticado, carregando } = useAuth()
  if (carregando) return <div className="app-loading">A carregar…</div>
  if (!autenticado) return <Navigate to="/" replace />
  return children
}

function AdminOnly({ children }) {
  const { usuario, carregando } = useAuth()
  if (carregando) return <div className="app-loading">A carregar…</div>
  if (!usuario?.admin) return <Navigate to="/listar-facturas" replace />
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaLogin />} />
      <Route element={<Protegida><Layout /></Protegida>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="editar-perfil" element={<EditarPerfil />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="mensagens" element={<Mensagens />} />
        <Route path="criar-cotacoes" element={<CriarCotacoes />} />
        <Route path="editar-cotacoes/:id" element={<EditarCotacoes />} />
        <Route path="editar-cotacoes" element={<EditarCotacoes />} />
        <Route path="listar-cotacoes" element={<ListarCotacoes />} />
        <Route path="facturacao" element={<AdminOnly><Facturacao /></AdminOnly>} />
        <Route path="facturacao/servico" element={<AdminOnly><FacturacaoServico /></AdminOnly>} />
        <Route path="listar-facturas" element={<ListarFacturas />} />
        <Route path="editar-facturas/:id" element={<EditarFacturas />} />
        <Route path="editar-facturas" element={<EditarFacturas />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="suporte" element={<Suporte />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
