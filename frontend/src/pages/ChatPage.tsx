import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { chatWithAssistant, getDocuments } from '../services/api'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    source: string
    page?: number
    chapter?: string
    similarity_score: number
  }>
  processing_time?: number
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<string>('')
  const [includeGuidelines, setIncludeGuidelines] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: documents } = useQuery('documents', getDocuments)

  const chatMutation = useMutation(chatWithAssistant, {
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        sources: data.sources,
        processing_time: data.processing_time
      }
      setMessages(prev => [...prev, assistantMessage])
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Terjadi kesalahan saat memproses pertanyaan')
    }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || chatMutation.isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])

    chatMutation.mutate({
      question: inputValue,
      document_id: selectedDocument || undefined,
      include_guidelines: includeGuidelines
    })

    setInputValue('')
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Chat Assistant</h1>
            <p className="text-secondary-600">Tanya jawab dengan AI tentang Pedoman Skripsi</p>
          </div>
        </div>

        {/* Chat Settings */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-secondary-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="include-guidelines"
              checked={includeGuidelines}
              onChange={(e) => setIncludeGuidelines(e.target.checked)}
              className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="include-guidelines" className="text-sm font-medium text-secondary-700">
              Sertakan Pedoman Skripsi
            </label>
          </div>

          <select
            value={selectedDocument}
            onChange={(e) => setSelectedDocument(e.target.value)}
            className="input-field text-sm"
          >
            <option value="">Pilih dokumen skripsi (opsional)</option>
            {documents?.documents?.filter(doc => doc.type === 'student_thesis').map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="card min-h-[500px] flex flex-col">
        <div className="flex-1 space-y-4 mb-4 max-h-[500px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-secondary-500">
              <Bot className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
              <p className="text-lg font-medium mb-2">Selamat datang di Chat Assistant!</p>
              <p className="text-sm">Ajukan pertanyaan tentang Pedoman Skripsi atau format penulisan.</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start space-x-3 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-secondary-100 text-secondary-600'
                      }`}>
                        {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      
                      <div className={`rounded-lg p-4 ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-secondary-100 text-secondary-900'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-secondary-200">
                            <p className="text-sm font-medium mb-2 text-secondary-700">Sumber Referensi:</p>
                            <div className="space-y-2">
                              {message.sources.map((source, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm">
                                  <FileText className="w-4 h-4 text-secondary-500" />
                                  <span className="text-secondary-700">
                                    {source.source}
                                    {source.page && ` - Hal. ${source.page}`}
                                    {source.chapter && ` - ${source.chapter}`}
                                  </span>
                                  <span className="text-xs text-secondary-500">
                                    ({Math.round(source.similarity_score * 100)}%)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                          <span>{formatTime(message.timestamp)}</span>
                          {message.processing_time && (
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{message.processing_time.toFixed(2)}s</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          
          {chatMutation.isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-secondary-600" />
                </div>
                <div className="bg-secondary-100 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                    <span className="text-secondary-600">AI sedang memproses pertanyaan Anda...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ketik pertanyaan Anda tentang Pedoman Skripsi..."
            className="input-field flex-1"
            disabled={chatMutation.isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || chatMutation.isLoading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {chatMutation.isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      </div>

      {/* Tips */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Tips untuk pertanyaan yang efektif:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ajukan pertanyaan spesifik tentang format penulisan, metodologi, atau aturan skripsi</li>
              <li>• Gunakan kata kunci seperti "format daftar pustaka", "metodologi penelitian", "struktur bab"</li>
              <li>• Upload skripsi Anda untuk mendapatkan feedback yang lebih personal</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatPage