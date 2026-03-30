import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '../api/auth.js'
import { useAuth } from '../contexts/AuthContext.jsx'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import { Card, CardBody } from '../components/ui/Card.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Button } from '../components/ui/Button.jsx'
import { useToast } from '../components/ui/Toast.jsx'

const profileSchema = z.object({
  firstName: z.string().min(1, 'Requis'),
  lastName: z.string().min(1, 'Requis'),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Requis'),
  newPassword: z.string().min(8, 'Minimum 8 caractères'),
})

export function SettingsPage() {
  const { user, updateUser } = useAuth()
  const toast = useToast()

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName || '', lastName: user?.lastName || '' },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  })

  const onProfileSubmit = async (data) => {
    try {
      const { data: updated } = await authApi.updateProfile(data)
      updateUser(updated)
      toast('Profil mis à jour', 'success')
    } catch { toast('Erreur', 'error') }
  }

  const onPasswordSubmit = async (data) => {
    try {
      await authApi.changePassword(data)
      passwordForm.reset()
      toast('Mot de passe modifié', 'success')
    } catch (err) {
      toast(err.response?.data?.error || 'Erreur', 'error')
    }
  }

  return (
    <div>
      <PageHeader title="Paramètres" />

      <div className="space-y-6 max-w-lg">
        <Card>
          <div className="px-5 py-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-800 font-heading">Profil</h3>
          </div>
          <CardBody>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <Input label="Prénom" error={profileForm.formState.errors.firstName?.message} {...profileForm.register('firstName')} />
              <Input label="Nom" error={profileForm.formState.errors.lastName?.message} {...profileForm.register('lastName')} />
              <Input label="Email" value={user?.email} disabled />
              <div className="flex justify-end">
                <Button type="submit" disabled={profileForm.formState.isSubmitting}>Enregistrer</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-800 font-heading">Mot de passe</h3>
          </div>
          <CardBody>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <Input label="Mot de passe actuel" type="password" error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
              <Input label="Nouveau mot de passe" type="password" error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
              <div className="flex justify-end">
                <Button type="submit" disabled={passwordForm.formState.isSubmitting}>Changer</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
