import { pool } from '../config/db.js'
import bcrypt from 'bcryptjs'

export async function findUserByUsername(username) {
  const [rows] = await pool.query(
    'SELECT id, nome, apelido, username, senha_hash, admin, imagem FROM usuarios WHERE username = ? LIMIT 1',
    [username]
  )
  return rows[0] || null
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, nome, apelido, username, senha_hash, admin, imagem FROM usuarios WHERE id = ? LIMIT 1',
    [id]
  )
  return rows[0] || null
}

export async function updateUser(id, { nome, apelido, username, imagem, novaSenha, admin }) {
  const updates = []
  const values = []
  if (nome != null) { updates.push('nome = ?'); values.push(nome) }
  if (apelido != null) { updates.push('apelido = ?'); values.push(apelido) }
  if (username != null) { updates.push('username = ?'); values.push(username) }
  if (imagem != null) { updates.push('imagem = ?'); values.push(imagem) }
  if (typeof admin === 'boolean') { updates.push('admin = ?'); values.push(admin ? 1 : 0) }
  if (novaSenha) {
    const hash = await bcrypt.hash(novaSenha, 10)
    updates.push('senha_hash = ?')
    values.push(hash)
  }
  if (updates.length === 0) return null
  values.push(id)
  await pool.query(
    `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
    values
  )
  return findUserById(id)
}

export async function createUser({ nome, apelido, username, senha, admin, imagem }) {
  const [existing] = await pool.query('SELECT id FROM usuarios WHERE username = ?', [username])
  if (existing.length > 0) return { error: 'username_duplicado' }
  const hash = await bcrypt.hash(senha, 10)
  await pool.query(
    `INSERT INTO usuarios (nome, apelido, username, senha_hash, admin, imagem) VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, apelido, username, hash, admin ? 1 : 0, imagem || null]
  )
  const [rows] = await pool.query('SELECT id, nome, apelido, username, admin, imagem FROM usuarios WHERE username = ?', [username])
  return rows[0]
}

export async function listUsers({ page = 1, limit = 5, q = '' }) {
  const offset = (Math.max(1, page) - 1) * Math.max(1, limit)
  const limitNum = Math.min(50, Math.max(1, limit))
  let where = ''
  const params = []
  if (q && String(q).trim()) {
    const term = `%${String(q).trim()}%`
    where = 'WHERE nome LIKE ? OR apelido LIKE ? OR username LIKE ?'
    params.push(term, term, term)
  }
  const [rows] = await pool.query(
    `SELECT id, nome, apelido, username, admin, imagem, criado_em FROM usuarios ${where} ORDER BY criado_em DESC LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  )
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM usuarios ${where}`,
    params
  )
  const total = Number(countRows[0]?.total ?? 0)
  return { utilizadores: rows, total, pagina: page, porPagina: limitNum }
}

export async function createDefaultAdminIfNotExists() {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM usuarios')
  if (rows[0].total > 0) return

  const senha = 'admin123'
  const hash = await bcrypt.hash(senha, 10)
  await pool.query(
    'INSERT INTO usuarios (nome, apelido, username, senha_hash, admin) VALUES (?, ?, ?, ?, ?)',
    ['Administrador', 'Sistema', 'admin', hash, 1]
  )
  console.log('Utilizador admin criado. Login: username=admin, senha=admin123')
}

