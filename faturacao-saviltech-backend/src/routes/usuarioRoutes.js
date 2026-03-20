import { Router } from 'express'
import { listar, criar, obterPorId, atualizar, adminOnly } from '../controllers/usuarioController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.use(authMiddleware)
router.use(adminOnly)

router.get('/', listar)
router.post('/', criar)
router.get('/:id', obterPorId)
router.put('/:id', atualizar)

export default router
