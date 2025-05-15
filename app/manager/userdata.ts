
'use server'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function getUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  try {
    const user = await verifyToken(token)
    return user
  } catch (error) {
    console.error('Invalid token:', error)
    return null
  }
}
