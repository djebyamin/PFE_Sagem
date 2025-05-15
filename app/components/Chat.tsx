import { useState } from 'react'
import { MessageList } from './MessageList'
import { MessageComposer } from './MessageComposer'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

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

export function Chat() {
  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message)
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Messages</h2>
        <Button
          variant="outline"
          onClick={() => setIsComposerOpen(true)}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Nouveau message
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        <MessageList onMessageClick={handleMessageClick} />
      </div>

      <MessageComposer
        isOpen={isComposerOpen}
        onOpenChange={setIsComposerOpen}
        onMessageSent={() => {
          setIsComposerOpen(false)
          setSelectedMessage(null)
        }}
      />
    </div>
  )
} 