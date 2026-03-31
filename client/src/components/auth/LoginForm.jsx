import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Input } from '../ui/Input.jsx'
import { Button } from '../ui/Button.jsx'
import { GoogleLoginButton } from './GoogleLoginButton.jsx'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})

export function LoginForm() {
  const { login, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      setError('')
      await login(data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion')
    }
  }

  const handleGoogleLogin = async (credential) => {
    try {
      setError('')
      const data = await googleLogin(credential)
      navigate(data.isNewUser ? '/onboarding' : '/')
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur de connexion Google')
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-danger-50 text-danger-600 text-sm">{error}</div>
      )}

      <GoogleLoginButton onSuccess={handleGoogleLogin} />

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-surface-200" />
        <span className="text-xs text-surface-400 uppercase">ou</span>
        <div className="flex-1 border-t border-surface-200" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="votre@email.com"
          icon={Mail}
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      <p className="text-sm text-center text-surface-500">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-primary-600 font-medium hover:underline">S'inscrire</Link>
      </p>
    </div>
  )
}
