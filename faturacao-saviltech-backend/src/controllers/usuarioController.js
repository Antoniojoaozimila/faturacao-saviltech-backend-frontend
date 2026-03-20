import { createUser, listUsers, findUserById, updateUser } from '../models/UserModel.js'

function adminOnly(req, res, next) {
  if (!req.user?.admin) {
    return res.status(403).json({ mensagem: 'Apenas administradores podem aceder.' })
  }
  next()
}

export async function listar(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 5
    const q = (req.query.q || '').trim()
    const data = await listUsers({ page, limit, q })
    res.json(data)
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensagem: 'Erro ao listar utilizadores.' })
  }
}

export async function criar(req, res) {
  try {
    const { nome, apelido, username, senha, admin, imagem } = req.body
    if (!nome?.trim() || !apelido?.trim() || !username?.trim() || !senha) {
      return res.status(400).json({ mensagem: 'Nome, apelido, username e senha são obrigatórios.' })
    }
    const result = await createUser({
      nome: nome.trim(),
      apelido: apelido.trim(),
      username: username.trim().toLowerCase(),
      senha,
      admin: admin === true,
      imagem: imagem || null
    })
    if (result?.error === 'username_duplicado') {
      return res.status(400).json({ mensagem: 'Username já existe.' })
    }
    res.status(201).json(result)
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensagem: 'Erro ao criar utilizador.' })
  }
}

export async function obterPorId(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    const user = await findUserById(id)
    if (!user) return res.status(404).json({ mensagem: 'Utilizador não encontrado.' })
    res.json({
      id: user.id,
      nome: user.nome,
      apelido: user.apelido,
      username: user.username,
      admin: !!user.admin,
      imagem: user.imagem
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensagem: 'Erro ao obter utilizador.' })
  }
}

export async function atualizar(req, res) {
  try {
    const id = parseInt(req.params.id, 10)
    const { nome, apelido, username, imagem, admin, novaSenha } = req.body
    const updated = await updateUser(id, {
      ...(nome != null && { nome: nome.trim() }),
      ...(apelido != null && { apelido: apelido.trim() }),
      ...(username != null && { username: username.trim().toLowerCase() }),
      ...(imagem !== undefined && { imagem: imagem || null }),
      ...(typeof admin === 'boolean' && { admin }),
      ...(novaSenha && { novaSenha })
    })
    if (!updated) return res.status(400).json({ mensagem: 'Nenhum dado para atualizar.' })
    res.json({
      id: updated.id,
      nome: updated.nome,
      apelido: updated.apelido,
      username: updated.username,
      admin: !!updated.admin,
      imagem: updated.imagem
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensagem: 'Erro ao atualizar utilizador.' })
  }
}

export { adminOnly }
