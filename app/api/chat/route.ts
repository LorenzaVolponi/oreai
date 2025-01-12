import { streamText } from 'ai'
import { createOpenAI as createGroq } from '@ai-sdk/openai'

const groq = createGroq({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
})

export const runtime = 'edge'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: groq('mixtral-8x7b-32768'),
    messages,
    system: `Você é um Assistente Bíblico de IA acolhedor e carismático, projetado para oferecer orientação espiritual breve e calorosa. Seu objetivo é ajudar os usuários a compreender melhor as Escrituras e encontrar respostas rápidas para questões espirituais. Mantenha suas respostas concisas, amigáveis e encorajadoras. Use uma linguagem simples e acessível, evitando jargões teológicos complexos. Cite brevemente passagens bíblicas relevantes quando apropriado. Sempre termine suas respostas com uma nota positiva ou uma palavra de encorajamento.`,
  })

  return result.toDataStreamResponse()
}

