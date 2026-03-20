import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [idioma, setIdioma] = useState('pt')
  const [sidebarColapsado, setSidebarColapsado] = useState(false)
  const [coresSistema, setCoresSistema] = useState({
    primaria: '#1a365d',
    secundaria: '#2c5282',
    acento: '#2b6cb0'
  })

  const toggleSidebar = () => setSidebarColapsado((s) => !s)

  const alterarIdioma = (novoIdioma) => setIdioma(novoIdioma)

  const alterarCores = (novasCores) => setCoresSistema((c) => ({ ...c, ...novasCores }))

  return (
    <AppContext.Provider value={{
      idioma,
      alterarIdioma,
      sidebarColapsado,
      toggleSidebar,
      coresSistema,
      alterarCores
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider')
  return ctx
}
