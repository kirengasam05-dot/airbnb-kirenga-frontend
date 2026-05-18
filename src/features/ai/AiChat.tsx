import { useState } from 'react'
import { FaRobot } from 'react-icons/fa'

import { aiChatRequest } from '../auth/api/aiApi'

import './AiChat.css'

export function AiChat() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [messages, setMessages] = useState<
    Array<{
      role: 'user' | 'ai'
      text: string
    }>
  >([
    {
      role: 'ai',
      text: 'Hello 👋 Ask me about stays, locations, prices, or recommendations.',
    },
  ])

  const sendMessage = async () => {
    if (!message.trim()) return

    const userMessage = message

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: userMessage,
      },
    ])

    setMessage('')
    setLoading(true)

    try {
      const response = await aiChatRequest(userMessage)

      const aiText =
        response?.reply ??
        response?.message ??
        response?.data?.reply ??
        response?.data?.message ??
        'AI assistant responded successfully.'

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: aiText,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'AI assistant is temporarily unavailable.',
        },
      ])
    }

    setLoading(false)
  }

  return (
    <>
      <button
        type="button"
        className="ai-chat-toggle"
        onClick={() => setOpen((prev) => !prev)}
      >
        <FaRobot />
        <span>AI Assistant</span>
      </button>

      {open && (
        <div className="ai-chat-box">
          <div className="ai-chat-header">
            <h3>AI Travel Assistant</h3>

            <button
              type="button"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`ai-message ${msg.role}`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="ai-chat-input">
            <input
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Ask AI anything..."
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}