import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import quoteRoutes from './routes/quoteRoutes.js'
import mensagemRoutes from './routes/mensagemRoutes.js'
import usuarioRoutes from './routes/usuarioRoutes.js'
import clienteRoutes from './routes/clienteRoutes.js'

const app = express()

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}))
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

