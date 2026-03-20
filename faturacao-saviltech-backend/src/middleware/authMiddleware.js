import jwt from 'jsonwebtoken'
import { findUserById } from '../models/UserModel.js'

const { APP_JWT_SECRET = 'changeme' } = process.env

export async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null
  if (!token) {
    return res.status(401).json({ mensagem: 'Token não fornecido.' })
  }
  try {
    const decoded = jwt.verify(token, APP_JWT_SECRET)
    const user = await findUserById(decoded.id)
    if (!user) {
      return res.status(401).json({ mensagem: 'Utilizador não encontrado.' })
    }
    req.user = {
      id: user.id,
      nome: user.nome,
      apelido: user.apelido,
      username: user.username,
      admin: !!user.admin,
      imagem: user.imagem
    }
    next()
  } catch (err) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado.' })
  }
}
