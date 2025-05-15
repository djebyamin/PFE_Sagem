import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { logoutAction } from '@/app/protected/logout'
import ManagerComponent from '@/app/manager/managercomponat'

export default async function ProtectedPage() {
  const cookieStore = cookies()
  const token = (await cookieStore).get('token')?.value

  const user = token ? await verifyToken(token) : null

  if (!user) {
    redirect('/login')
    return null
  }

  const isManager = user.roles?.includes('manager')

  if (!isManager) {
    redirect('/login')
    return null
  }

  async function handleLogout() {
    'use server'
    await logoutAction()
    redirect('/login')
  }

  return <ManagerComponent user={user} />
}
