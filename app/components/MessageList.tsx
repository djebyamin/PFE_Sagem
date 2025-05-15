import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  id: string
  contenu: string
  date_envoi: string
  lu: boolean
  expediteur: {
    id: string
    nom: string
    prenom: string
    image?: string | null
  }
}

interface MessageListProps {
  onMessageClick?: (message: Message) => void
}

export function MessageList({ onMessageClick }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch('/api/messages', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) throw new Error('Erreur lors de la récupération des messages')
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 30000) // Rafraîchir toutes les 30 secondes

    return () => clearInterval(interval)
  }, [])

  const handleMessageClick = async (message: Message) => {
    if (!message.lu) {
      try {
        const token = localStorage.getItem('token')
        if (!token) return

        const response = await fetch(`/api/messages/${message.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (!response.ok) throw new Error('Erreur lors du marquage du message comme lu')
        
        setMessages(messages.map(m => 
          m.id === message.id ? { ...m, lu: true } : m
        ))
      } catch (error) {
        console.error('Erreur:', error)
      }
    }
    onMessageClick?.(message)
  }

  if (loading) {
    return <div>Chargement des messages...</div>
  }

  return (
    <ScrollArea className="h-[600px] rounded-md border p-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500">Aucun message</div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-4 p-4 rounded-lg cursor-pointer hover:bg-gray-100 ${
                !message.lu ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleMessageClick(message)}
            >
              <Avatar>
                <AvatarImage src={message.expediteur.image || undefined} />
                <AvatarFallback>
                  {message.expediteur.prenom[0]}
                  {message.expediteur.nom[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    {message.expediteur.prenom} {message.expediteur.nom}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(message.date_envoi).toLocaleString()}
                  </p>
                </div>
                <p className="text-gray-700">{message.contenu}</p>
                {!message.lu && (
                  <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                    Non lu
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  )
} 