import { Router } from 'express'
import { listar } from '../controllers/clienteController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', authMiddleware, listar)

export default router
