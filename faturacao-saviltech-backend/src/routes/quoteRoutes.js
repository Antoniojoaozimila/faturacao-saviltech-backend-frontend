import { Router } from 'express'
import { listarCotacoes, criarCotacao } from '../controllers/quoteController.js'

const router = Router()

router.get('/', listarCotacoes)
router.post('/', criarCotacao)

export default router

