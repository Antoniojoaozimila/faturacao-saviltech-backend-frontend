import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { findUserByUsername, findUserById, updateUser } from '../models/UserModel.js'

const { APP_JWT_SECRET = 'changeme' } = process.env

export async function login(req, res) {
  try {
    const { username, senha } = req.body
    if (!username || !senha) {
      return res.status(400).json({ mensagem: 'Username e senha são obrigatórios.' })
    }

    const user = await findUserByUsername(username)
    if (!user) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' })
    }

    const ok = await bcrypt.compare(senha, user.senha_hash)
    if (!ok) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas.' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, admin: !!user.admin },
      APP_JWT_SECRET,
      { expiresIn: '8h' }
    )

    return res.json({
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        apelido: user.apelido,
        username: user.username,
        admin: !!user.admin,
        imagem: user.imagem
      }
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ mensagem: 'Erro interno ao autenticar.' })
  }
}

export async function atualizarPerfil(req, res) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ mensagem: 'Não autenticado.' })
    const { nome, apelido, username, imagem, senhaAtual, novaSenha } = req.body
    if (novaSenha) {
      const user = await findUserById(userId)
      if (!user) return res.status(404).json({ mensagem: 'Utilizador não encontrado.' })
      const ok = await bcrypt.compare(senhaAtual || '', user.senha_hash)
      if (!ok) return res.status(400).json({ mensagem: 'Senha atual incorreta.' })
    }
    const updated = await updateUser(userId, {
      ...(nome != null && { nome }),
      ...(apelido != null && { apelido }),
      ...(username != null && { username }),
      ...(imagem != null && { imagem }),
      ...(novaSenha && { novaSenha }),
    })
    if (!updated) return res.status(400).json({ mensagem: 'Nenhum dado para atualizar.' })
    return res.json({
      id: updated.id,
      nome: updated.nome,
      apelido: updated.apelido,
      username: updated.username,
      admin: !!updated.admin,
      imagem: updated.imagem,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ mensagem: 'Erro ao atualizar perfil.' })
  }
}

