import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bell, Mail, Smartphone } from 'lucide-react'
import { authApi } from '../api/auth.js'
import { notificationsApi } from '../api/notifications.js'
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

function Toggle({ checked, onChange, label, description, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18} className="text-surface-400" />}
        <div>
          <p className="text-sm font-medium text-surface-800">{label}</p>
          {description && <p className="text-xs text-surface-400">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${checked ? 'bg-primary-500' : 'bg-surface-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  )
}

export function SettingsPage() {
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [notifyEmail, setNotifyEmail] = useState(user?.notifyEmail ?? true)
  const [notifyPush, setNotifyPush] = useState(user?.notifyPush ?? true)
  const [pushSupported] = useState('serviceWorker' in navigator && 'PushManager' in window)

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

  const handleToggleEmail = async (value) => {
    setNotifyEmail(value)
    try {
      await notificationsApi.updatePreferences({ notifyEmail: value })
      toast(value ? 'Notifications email activées' : 'Notifications email désactivées', 'success')
    } catch { toast('Erreur', 'error'); setNotifyEmail(!value) }
  }

  const handleTogglePush = async (value) => {
    setNotifyPush(value)
    try {
      if (value && pushSupported) {
        // Request push permission and subscribe
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          const reg = await navigator.serviceWorker.ready
          const vapidRes = await notificationsApi.getVapidKey()
          const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidRes.data.publicKey,
          })
          await notificationsApi.subscribePush(subscription.toJSON())
        } else {
          setNotifyPush(false)
          toast('Permission de notification refusée par le navigateur', 'warning')
          return
        }
      } else if (!value) {
        await notificationsApi.unsubscribePush()
      }
      await notificationsApi.updatePreferences({ notifyPush: value })
      toast(value ? 'Notifications push activées' : 'Notifications push désactivées', 'success')
    } catch {
      toast('Erreur lors de la configuration push', 'error')
      setNotifyPush(!value)
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
            <h3 className="font-semibold text-surface-800 font-heading flex items-center gap-2">
              <Bell size={18} /> Notifications
            </h3>
          </div>
          <CardBody>
            <Toggle
              icon={Mail}
              checked={notifyEmail}
              onChange={handleToggleEmail}
              label="Notifications par email"
              description="Rappels de relance, deadlines, check-in objectifs"
            />
            <Toggle
              icon={Smartphone}
              checked={notifyPush}
              onChange={handleTogglePush}
              label="Notifications push"
              description={pushSupported ? 'Alertes en temps réel dans le navigateur' : 'Non supporté par ce navigateur'}
            />
          </CardBody>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-800 font-heading">Mot de passe</h3>
          </div>
          <CardBody>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <Input label="Mot de passe actuel" type="password" autoComplete="current-password" error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
              <Input label="Nouveau mot de passe" type="password" autoComplete="new-password" error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
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
