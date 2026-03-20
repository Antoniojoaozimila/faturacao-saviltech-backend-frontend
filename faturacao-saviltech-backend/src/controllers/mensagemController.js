import { listarMensagens, criarMensagem, responderMensagem } from '../models/MensagemModel.js'

export async function listar(req, res) {
  try {
    const dados = await listarMensagens()
    res.json(dados)
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensagem: 'Erro ao listar mensagens.' })
  }
}

export async function criar(req, res) {
  try {
    const { nome, email, assunto, mensagem } = req.body
    if (!nome || !email || !assunto || !mensagem) {
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' })
    }
    const nova = await criarMensagem({ nome, email, assunto, mensagem })
    res.status(201).json(nova)
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensagem: 'Erro ao criar mensagem.' })
  }
}

export async function responder(req, res) {
  try {
    const { id } = req.params
    const { resposta } = req.body
    if (!resposta) return res.status(400).json({ mensagem: 'Resposta é obrigatória.' })
    const utilizadorId = req.user?.id ?? null
    await responderMensagem(id, resposta, utilizadorId)
    res.status(204).end()
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensagem: 'Erro ao responder mensagem.' })
  }
}
