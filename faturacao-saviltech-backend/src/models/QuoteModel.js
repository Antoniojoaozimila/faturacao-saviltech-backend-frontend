import { pool } from '../config/db.js'

export async function getAllQuotes() {
  const [rows] = await pool.query(
    `SELECT
       c.id,
       c.numero,
       c.cliente,
       c.valor_total  AS valor,
       c.estado,
       c.servico_principal AS servico,
       c.data_criacao
     FROM cotacoes c
     ORDER BY c.data_criacao DESC`
  )
  return rows
}

export async function createQuote({ numero, cliente, valor, estado, servico }) {
  const [result] = await pool.query(
    `INSERT INTO cotacoes (numero, cliente, valor_total, estado, servico_principal)
     VALUES (?, ?, ?, ?, ?)`,
    [numero, cliente, valor, estado, servico]
  )
  const [rows] = await pool.query(
    `SELECT
       id,
       numero,
       cliente,
       valor_total  AS valor,
       estado,
       servico_principal AS servico,
       data_criacao
     FROM cotacoes
     WHERE id = ?`,
    [result.insertId]
  )
  return rows[0]
}

