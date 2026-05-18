import { useEffect, useState } from 'react'

export type Message = {
  id: number
  sender: string
  receiver: string
  text: string
  role: 'GUEST' | 'HOST'
  createdAt: string
}

const STORAGE_KEY = 'messages'

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  })

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages),
    )
  }, [messages])

  const sendMessage = (
    sender: string,
    receiver: string,
    text: string,
    role: 'GUEST' | 'HOST',
  ) => {
    const newMessage: Message = {
      id: Date.now(),
      sender,
      receiver,
      text,
      role,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [
      ...prev,
      newMessage,
    ])
  }

  return {
    messages,
    sendMessage,
  }
}