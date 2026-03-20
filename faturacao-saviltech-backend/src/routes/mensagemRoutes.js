import { Router } from 'express'
import { listar, criar, responder } from '../controllers/mensagemController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', authMiddleware, listar)
router.post('/', criar)
router.post('/:id/responder', authMiddleware, responder)

export default router
