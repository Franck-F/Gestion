import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Input } from '../ui/Input.jsx'
import { Button } from '../ui/Button.jsx'

const schema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
})

export function RegisterForm() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      setError('')
      await authRegister(data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-danger-50 text-danger-600 text-sm">{error}</div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Prénom"
          placeholder="Jean"
          icon={User}
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Input
          label="Nom"
          placeholder="Dupont"
          icon={User}
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>
      <Input
        label="Email"
        type="email"
        placeholder="votre@email.com"
        icon={Mail}
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Mot de passe"
        type="password"
        placeholder="Minimum 8 caractères"
        icon={Lock}
        error={errors.password?.message}
        {...register('password')}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Inscription...' : 'Créer un compte'}
      </Button>
      <p className="text-sm text-center text-surface-500">
        Déjà un compte ?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">Se connecter</Link>
      </p>
    </form>
  )
}
