import { Router } from 'express'
import { login, atualizarPerfil } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/login', login)
router.put('/perfil', authMiddleware, atualizarPerfil)

export default router

