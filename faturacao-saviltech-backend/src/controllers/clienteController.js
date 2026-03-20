import { listarClientes } from '../models/ClienteModel.js'

export async function listar(req, res) {
  try {
    const q = (req.query.q || req.query.search || '').trim()
    const clientes = await listarClientes(q)
    res.json(clientes)
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensagem: 'Erro ao listar clientes.' })
  }
}
