import { pool } from '../config/db.js'

/**
 * Lista clientes distintos das tabelas cotacoes e facturas (para pesquisa na Facturação).
 */
export async function listarClientes(q = '') {
  const term = q && String(q).trim() ? `%${String(q).trim()}%` : null
  const [rows] = await pool.query(
    `SELECT DISTINCT cliente, nif_cliente, email_cliente, telefone_cliente
     FROM (
       SELECT cliente, nif_cliente, email_cliente, telefone_cliente FROM cotacoes WHERE cliente IS NOT NULL AND cliente != ''
       UNION
       SELECT cliente, nif_cliente, email_cliente, telefone_cliente FROM facturas WHERE cliente IS NOT NULL AND cliente != ''
     ) AS t
     ${term ? 'WHERE cliente LIKE ? OR email_cliente LIKE ? OR nif_cliente LIKE ?' : ''}
     ORDER BY cliente
     LIMIT 100`,
    term ? [term, term, term] : []
  )
  return rows
}
