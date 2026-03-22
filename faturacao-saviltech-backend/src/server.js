import dotenv from 'dotenv'
import app from './app.js'
import { testConnection } from './config/db.js'
import { createDefaultAdminIfNotExists } from './models/UserModel.js'

dotenv.config()

const PORT = process.env.APP_PORT || 4000

/** Espera pela BD (Docker: MySQL demora a ficar pronto após o container subir). */
async function waitForDatabase({
  maxAttempts = 30,
  delayMs = 2000,
} = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await testConnection()
      if (attempt > 1) {
        console.log(`Ligação à base de dados estabelecida (tentativa ${attempt}).`)
      }
      return
    } catch (err) {
      const msg = err?.message || String(err)
      console.warn(
        `BD indisponível (${attempt}/${maxAttempts}): ${msg}`
      )
      if (attempt === maxAttempts) {
        throw err
      }
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
}

async function start() {
  try {
    await waitForDatabase()
    await createDefaultAdminIfNotExists()
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Backend a correr na porta ${PORT} (0.0.0.0)`)
    })
  } catch (err) {
    console.error('Erro ao iniciar backend:', err)
    process.exit(1)
  }
}

start()

