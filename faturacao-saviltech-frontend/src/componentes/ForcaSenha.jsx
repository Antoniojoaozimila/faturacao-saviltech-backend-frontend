import { useApp } from '../contexto/AppContext'
import { traducoes } from '../contexto/traducoes'
import './ForcaSenha.css'

function calcularForca(senha) {
  if (!senha || senha.length === 0) return null
  let pontos = 0
  if (senha.length >= 8) pontos += 1
  if (senha.length >= 12) pontos += 1
  if (/[a-z]/.test(senha)) pontos += 1
  if (/[A-Z]/.test(senha)) pontos += 1
  if (/\d/.test(senha)) pontos += 1
  if (/[^a-zA-Z0-9]/.test(senha)) pontos += 1
  if (pontos <= 2) return 'fraca'
  if (pontos <= 4) return 'razoavel'
  return 'forte'
}

export function ForcaSenha({ valor }) {
  const { idioma } = useApp()
  const t = traducoes[idioma] || traducoes.pt
  const forca = calcularForca(valor)
  if (!forca) return null
  const labels = { fraca: t.senhaFraca, razoavel: t.senhaRazoavel, forte: t.senhaForte }
  return (
    <div className={'forca-senha forca-senha--' + forca} role="status" aria-live="polite">
      <div className="forca-senha-barras">
        <span className="forca-senha-bar" />
        <span className="forca-senha-bar" />
        <span className="forca-senha-bar" />
      </div>
      <span className="forca-senha-label">{labels[forca]}</span>
    </div>
  )
}

export { calcularForca }
