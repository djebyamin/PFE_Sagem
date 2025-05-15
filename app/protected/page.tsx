import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyToken } from '@/lib/auth'
import { logoutAction } from '@/app/protected/logout'

export default async function ProtectedPage() {
  const cookieStore = await cookies() // ✅ This is synchronous
  const token = cookieStore.get('token')?.value // ✅ No need to await cookies() here

  // If token exists, verify it, else redirect to login
  const user = token ? await verifyToken(token) : null

  if (!user) {
    redirect('/login')
    return null // This ensures the rest of the code doesn't execute after redirect
  }

  async function handleLogout() {
    'use server'
    await logoutAction()
    redirect('/login')
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Bienvenue {user.nom} 👋</h1>
      <p><strong>Prénom :</strong> {user.prenom}</p>
      <p><strong>Email :</strong> {user.email}</p>
      <p><strong>Identifiant :</strong> {user.identifiant}</p>
      <p><strong>ID :</strong> {user.id}</p>
      <p><strong>role</strong> {user.roles}</p>

      
      
      

      <form action={handleLogout} className="mt-6">
        <button
          type="submit"
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Se déconnecter
        </button>
      </form>
    </div>
  )
}
