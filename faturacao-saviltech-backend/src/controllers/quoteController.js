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
    const { cliente, valor, estado, servico } = req.body
    if (!cliente || !valor || !estado) {
      return res.status(400).json({ mensagem: 'Cliente, valor e estado são obrigatórios.' })
    }
    const nova = await createQuote({ cliente, valor, estado, servico: servico || null })
    return res.status(201).json(nova)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ mensagem: 'Erro ao criar cotação.' })
  }
}

