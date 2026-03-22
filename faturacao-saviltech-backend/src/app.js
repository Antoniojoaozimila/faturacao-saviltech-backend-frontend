import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import quoteRoutes from './routes/quoteRoutes.js'
import mensagemRoutes from './routes/mensagemRoutes.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import clienteRoutes from './routes/clienteRoutes.js'

const app = express()

/**
 * Origens permitidas no browser (CORS).
 * Em produção o frontend costuma estar noutra origem que o backend (ex.: porta 80 vs 3000).
 * Defina CORS_ORIGINS no .env, separado por vírgulas. Ex.:
 *   CORS_ORIGINS=http://localhost:5173,http://147.93.89.17,https://seudominio.com
 */
function corsOriginOption() {
  const raw = process.env.CORS_ORIGINS
  const list = raw
    ? raw.split(',').map((s) => s.trim()).filter(Boolean)
    : ['http://localhost:5173']

  return (origin, callback) => {
    // Sem Origin: ferramentas como Postman, ou pedidos não-browser
    if (!origin) {
      return callback(null, true)
    }
    if (list.includes(origin)) {
      return callback(null, true)
    }
    return callback(null, false)
  }
}

app.use(
  cors({
    origin: corsOriginOption(),
    credentials: true,
  })
)
app.use(express.json({ limit: '10mb' }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend sistema-cotacao ativo.' })
})

app.use('/api/auth', authRoutes)
app.use('/api/cotacoes', quoteRoutes)
app.use('/api/mensagens', mensagemRoutes)
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/clientes', clienteRoutes)

export default app

