import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { candidaturesApi } from '../../api/candidatures.js'
import { Input } from '../ui/Input.jsx'
import { Select } from '../ui/Select.jsx'
import { Button } from '../ui/Button.jsx'
import { useToast } from '../ui/Toast.jsx'
import { CANDIDATURE_STATUS } from '../../utils/constants.js'

const schema = z.object({
  companyName: z.string().min(1, 'Nom requis'),
  jobTitle: z.string().min(1, 'Poste requis'),
  jobUrl: z.string().url('URL invalide').or(z.literal('')).optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  salary: z.string().optional(),
  description: z.string().optional(),
})

export function CandidatureForm({ candidature, onSuccess }) {
  const toast = useToast()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: candidature?.companyName || '',
      jobTitle: candidature?.jobTitle || '',
      jobUrl: candidature?.jobUrl || '',
      location: candidature?.location || '',
      status: candidature?.status || 'A_POSTULER',
      salary: candidature?.salary || '',
      description: candidature?.description || '',
    },
  })

  const onSubmit = async (data) => {
    try {
      const cleaned = { ...data, jobUrl: data.jobUrl || null }
      if (candidature) {
        await candidaturesApi.update(candidature.id, cleaned)
        toast('Candidature mise à jour', 'success')
      } else {
        await candidaturesApi.create(cleaned)
        toast('Candidature créée', 'success')
      }
      onSuccess?.()
    } catch {
      toast('Erreur lors de la sauvegarde', 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Entreprise" error={errors.companyName?.message} {...register('companyName')} />
        <Input label="Poste" error={errors.jobTitle?.message} {...register('jobTitle')} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Lieu" {...register('location')} />
        <Input label="Salaire" {...register('salary')} />
      </div>
      <Input label="URL de l'offre" type="url" error={errors.jobUrl?.message} {...register('jobUrl')} />
      <Select
        label="Statut"
        options={Object.entries(CANDIDATURE_STATUS).map(([value, { label }]) => ({ value, label }))}
        {...register('status')}
      />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-surface-700">Description / Notes</label>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 text-sm text-surface-800 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          {...register('description')}
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : candidature ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}
