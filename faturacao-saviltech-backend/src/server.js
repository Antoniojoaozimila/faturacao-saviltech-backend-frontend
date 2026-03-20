import dotenv from 'dotenv'
import app from './app.js'
import { testConnection } from './config/db.js'
import { createDefaultAdminIfNotExists } from './models/UserModel.js'

dotenv.config()

const PORT = process.env.APP_PORT || 4000

async function start() {
  try {
    await testConnection()
    await createDefaultAdminIfNotExists()
    app.listen(PORT, () => {
      console.log(`Backend a correr em http://localhost:${PORT}`)
    })
  } catch (err) {
    console.error('Erro ao iniciar backend:', err)
    process.exit(1)
  }
}

start()

