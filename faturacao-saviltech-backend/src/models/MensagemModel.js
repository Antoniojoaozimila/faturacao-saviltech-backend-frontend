import { pool } from '../config/db.js'

export async function listarMensagens() {
  const [rows] = await pool.query(
    `SELECT id, nome_cliente, email, assunto, mensagem, lida, resposta, data_criacao
     FROM mensagens
     ORDER BY data_criacao DESC`
  )
  return rows
}

export async function criarMensagem({ nome, email, assunto, mensagem }) {
  const [res] = await pool.query(
    `INSERT INTO mensagens (nome_cliente, email, assunto, mensagem)
     VALUES (?, ?, ?, ?)`,
    [nome, email, assunto, mensagem]
  )
  const [rows] = await pool.query(
    `SELECT id, nome_cliente, email, assunto, mensagem, lida, resposta, data_criacao
     FROM mensagens WHERE id = ?`,
    [res.insertId]
  )
  return rows[0]
}

export async function responderMensagem(id, resposta, utilizadorId = null) {
  await pool.query(
    `UPDATE mensagens
     SET resposta = ?, lida = 1, utilizador_resposta_id = ?, data_resposta = NOW()
     WHERE id = ?`,
    [resposta, utilizadorId, id]
  )
}
