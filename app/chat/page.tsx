'use client'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import ChatComponent from '../communication/chatcomponent'

export default async function ChatPage() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  const user = token ? await verifyToken(token) : null

  if (!user) {
    redirect('/login')
    return null
  }

  const isManager = user.roles?.includes('manager')
  const isTechnician = user.roles?.includes('technician')

  if (!isManager && !isTechnician) {
    redirect('/unauthorized')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ChatComponent user={user} />
    </div>
  )
} 