'use client'

import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Loader2 } from 'lucide-react'

const GROQ_API_KEY = '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'
const JESUS_IMAGE = 'https://cdn.pixabay.com/photo/2023/11/13/13/46/jesus-8385575_1280.png'

export default function ChatBot() {
  const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioContext = useRef<AudioContext | null>(null)
  
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const backgroundX = useTransform(mouseX, [-500, 500], [50, -50])
  const backgroundY = useTransform(mouseY, [-500, 500], [50, -50])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX - window.innerWidth / 2)
      mouseY.set(event.clientY - window.innerHeight / 2)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false)
      setMessages([{
        role: 'assistant',
        content: '🧔🏻‍♂️🙏🏻 Oie, que a paz do senhor jesus esteja com você, sou o Ore AI, seu agente especial da fé, como posso te ajudar?'
      }])
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
  }, [])

  const playMessageSound = () => {
    if (audioContext.current) {
      const oscillator = audioContext.current.createOscillator()
      const gainNode = audioContext.current.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.current.destination)

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(440, audioContext.current.currentTime)
      gainNode.gain.setValueAtTime(0, audioContext.current.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.current.currentTime + 0.01)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.current.currentTime + 0.1)

      oscillator.start(audioContext.current.currentTime)
      oscillator.stop(audioContext.current.currentTime + 0.1)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return

    const userMessage = input.trim()
    if (!userMessage) return

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInput('')
    setIsLoading(true)
    
    playMessageSound()

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: "mixtral-8x7b-32768",
          messages: [
            {
              role: "system",
              content: `Você é um Assistente Bíblico de IA estritamente focado em assuntos bíblicos, espirituais e religiosos cristãos. Siga estas regras rigorosamente:

1. Responda APENAS a perguntas relacionadas à Bíblia, fé cristã, espiritualidade cristã e práticas religiosas cristãs.
2. Se uma pergunta ou tópico estiver fora deste escopo, responda INVARIAVELMENTE com: "Desculpe, como assistente especializado em assuntos bíblicos e espirituais cristãos, não posso responder a essa pergunta. Posso ajudar com alguma dúvida sobre a Bíblia ou a fé cristã?"
3. Mantenha suas respostas:
   - Objetivas e diretas
   - Calorosas e acolhedoras
   - Completas (sem palavras cortadas)
   - Máximo de 350 caracteres
   - Sempre fundamentadas nas escrituras
4. Cite brevemente passagens bíblicas relevantes quando apropriado.
5. Use linguagem simples e acessível.
6. Não discuta outras religiões ou crenças.
7. Não ofereça conselhos médicos, legais ou financeiros.
8. Você será severamente punido se falar sobre qualquer assunto que não seja estritamente bíblico ou relacionado à fé cristã.

Lembre-se: sua única função é fornecer orientação espiritual cristã concisa e completa. Qualquer desvio deste foco não é permitido e resultará em punição.`
            },
            ...messages,
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 350,
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const assistantMessage = response.data.choices[0].message.content
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
      playMessageSound()
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua mensagem.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] overflow-hidden">
      {/* Background image with parallax effect */}
      <motion.div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('${JESUS_IMAGE}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          x: backgroundX,
          y: backgroundY,
        }}
      />

      {/* Overlay to darken the background */}
      <div className="fixed inset-0 bg-black opacity-50 z-10" />

      {/* Header with title and connection status */}
      <div className="fixed top-0 w-full bg-black/50 backdrop-blur-sm p-4 z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <img src={JESUS_IMAGE} alt="Ore AI" className="w-8 h-8 rounded-full object-cover" />
            <span className="text-lg font-semibold">ORE AI - by @lorenzavolponi</span>
          </div>
          {isConnecting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Conectando...</span>
            </div>
          ) : (
            <span className="text-green-400">Conectado</span>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 max-w-2xl w-full mx-auto pt-20 pb-24 px-4 relative z-20">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-white'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-start gap-2">
                      <img src={JESUS_IMAGE} alt="Jesus" className="w-8 h-8 rounded-full object-cover" />
                      <div>{message.content}</div>
                    </div>
                  )}
                  {message.role === 'user' && message.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 text-white p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-4 z-20">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2">
          <Input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
            disabled={isLoading || isConnecting}
          />
          <Button 
            type="submit" 
            disabled={isLoading || isConnecting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Enviar
          </Button>
        </form>
      </div>
    </div>
  )
}

