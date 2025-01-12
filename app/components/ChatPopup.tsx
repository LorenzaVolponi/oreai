import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from 'lucide-react'

const GROQ_API_KEY = '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'

interface ChatPopupProps {
  isOpen: boolean
  onClose: () => void
}

const ChatPopup: React.FC<ChatPopupProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioContext = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (isOpen) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

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
              content: "Você é um Assistente Bíblico de IA amigável e conciso. Forneça respostas curtas e diretas, como em um diálogo natural. Use linguagem simples e acessível. Cite brevemente passagens bíblicas relevantes quando apropriado. Mantenha um tom encorajador e positivo."
            },
            ...messages,
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 150
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 right-4 w-96"
        >
          <Card className="w-full shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg flex justify-between items-center">
              <CardTitle className="text-xl font-bold">Chat Bíblico</CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="h-96 p-4">
              <ScrollArea className="h-full w-full pr-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    <span
                      className={`inline-block p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 shadow-md'
                      }`}
                    >
                      {message.content}
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-left mb-2">
                    <span className="inline-block p-3 rounded-lg bg-gray-200 text-gray-800">
                      Digitando...
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
            </CardContent>
            <CardFooter className="bg-gray-100 rounded-b-lg">
              <form onSubmit={handleSubmit} className="flex w-full space-x-2">
                <Input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Digite sua pergunta..."
                  className="flex-grow bg-white"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                >
                  Enviar
                </Button>
              </form>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ChatPopup

