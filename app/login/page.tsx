'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { loginAction } from '@/app/login/LoginAction'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const loginSchema = z.object({
  identifiant: z.string().min(1, 'Champ requis'),
  mot_de_passe: z.string().min(1, 'Champ requis'),
})

type LoginSchema = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginSchema) => {
    setError('')
    const result = await loginAction(data)
  
    if (result?.error) {
      setError(result.error)
    } else if (result?.redirectTo) {
      window.location.href = result.redirectTo
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center">Connexion</h2>

      <div>
        <Input placeholder="Identifiant" {...register('identifiant')} />
        {errors.identifiant && <p className="text-red-500 text-sm">{errors.identifiant.message}</p>}
      </div>

      <div>
        <Input type="password" placeholder="Mot de passe" {...register('mot_de_passe')} />
        {errors.mot_de_passe && <p className="text-red-500 text-sm">{errors.mot_de_passe.message}</p>}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        Se connecter
      </Button>
    </form>
  )
}
