import { getAllQuotes, createQuote } from '../models/QuoteModel.js'

export async function listarCotacoes(req, res) {
  try {
    const dados = await getAllQuotes()
    return res.json(dados)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ mensagem: 'Erro ao listar cotações.' })
  }
}

export async function criarCotacao(req, res) {
  try {
    const { numero, cliente, valor, estado, servico } = req.body
    if (!numero || !cliente || valor == null || !estado) {
      return res
        .status(400)
        .json({ mensagem: 'Número, cliente, valor e estado são obrigatórios.' })
    }
    const nova = await createQuote({
      numero,
      cliente,
      valor,
      estado,
      servico: servico || null
    })
    return res.status(201).json(nova)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ mensagem: 'Erro ao criar cotação.' })
  }
}

