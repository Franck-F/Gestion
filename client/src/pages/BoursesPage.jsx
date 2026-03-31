import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, GraduationCap, Trash2, Edit, ChevronRight } from 'lucide-react'
import { boursesApi } from '../api/bourses.js'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Card, CardBody } from '../components/ui/Card.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { PageSpinner } from '../components/ui/Spinner.jsx'
import { ErrorState } from '../components/ui/ErrorState.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { BOURSE_STATUS } from '../utils/constants.js'
import { formatDate, formatDeadline, isOverdue } from '../utils/dateUtils.js'
import { Input } from '../components/ui/Input.jsx'
import { Select } from '../components/ui/Select.jsx'

function BourseForm({ bourse, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState({
    name: bourse?.name || '', organism: bourse?.organism || '', type: bourse?.type || '',
    amount: bourse?.amount || '', status: bourse?.status || 'RECHERCHE',
    eligibility: bourse?.eligibility || '', applicationUrl: bourse?.applicationUrl || '',
    deadline: bourse?.deadline ? new Date(bourse.deadline).toISOString().slice(0, 16) : '',
    notes: bourse?.notes || '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...form,
        amount: form.amount ? parseFloat(form.amount) : null,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        applicationUrl: form.applicationUrl || null,
      }
      if (bourse) { await boursesApi.update(bourse.id, data) }
      else { await boursesApi.create(data) }
      toast(bourse ? 'Bourse mise à jour' : 'Bourse créée', 'success')
      onSuccess?.()
    } catch { toast('Erreur', 'error') }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nom de la bourse" value={form.name} onChange={set('name')} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Organisme" value={form.organism} onChange={set('organism')} />
        <Input label="Montant (€)" type="number" value={form.amount} onChange={set('amount')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Statut" value={form.status} onChange={set('status')} options={Object.entries(BOURSE_STATUS).map(([v, { label }]) => ({ value: v, label }))} />
        <Input label="Date limite" type="datetime-local" value={form.deadline} onChange={set('deadline')} />
      </div>
      <Input label="URL de candidature" value={form.applicationUrl} onChange={set('applicationUrl')} />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-surface-700">Éligibilité / Notes</label>
        <textarea rows={3} className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" value={form.eligibility} onChange={set('eligibility')} />
      </div>
      <div className="flex justify-end"><Button type="submit">{bourse ? 'Modifier' : 'Créer'}</Button></div>
    </form>
  )
}

export function BoursesPage() {
  const [showForm, setShowForm] = useState(false)
  const [editBourse, setEditBourse] = useState(null)
  const [deleteBourse, setDeleteBourse] = useState(null)
  const queryClient = useQueryClient()
  const toast = useToast()
  const navigate = useNavigate()

  const { data: bourses = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['bourses'],
    queryFn: () => boursesApi.list().then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => boursesApi.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bourses'] }); toast('Bourse supprimée') },
  })

  if (isLoading) return <PageSpinner />
  if (isError) return <ErrorState message="Impossible de charger les données" onRetry={refetch} />

  return (
    <div>
      <PageHeader
        title="Bourses & Aides"
        description={`${bourses.length} bourse(s) suivie(s)`}
        action={<Button size="sm" onClick={() => { setEditBourse(null); setShowForm(true) }}><Plus size={16} /> Ajouter</Button>}
      />

      {bourses.length === 0 ? (
        <EmptyState icon={GraduationCap} title="Aucune bourse" description="Ajoutez les bourses et aides que vous suivez" actionLabel="Ajouter une bourse" onAction={() => setShowForm(true)} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {bourses.map(b => {
            const sc = BOURSE_STATUS[b.status]
            const docsReady = b.requiredDocs?.filter(d => d.status === 'PRET').length || 0
            const docsTotal = b.requiredDocs?.length || 0
            return (
              <Card key={b.id} hover onClick={() => navigate(`/bourses/${b.id}`)} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-surface-800 truncate">{b.name}</p>
                    {b.organism && <p className="text-xs text-surface-500 mt-0.5">{b.organism}</p>}
                  </div>
                  <Badge className={sc.color}>{sc.label}</Badge>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-4 text-xs text-surface-400">
                    {b.amount && <span>{parseFloat(b.amount).toLocaleString()}€</span>}
                    {b.deadline && (
                      <span className={isOverdue(b.deadline) ? 'text-danger-500 font-medium' : ''}>
                        {formatDeadline(b.deadline)}
                      </span>
                    )}
                  </div>
                  {docsTotal > 0 && (
                    <span className="text-xs text-surface-400">{docsReady}/{docsTotal} docs</span>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editBourse ? 'Modifier la bourse' : 'Nouvelle bourse'} size="lg">
        <BourseForm bourse={editBourse} onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['bourses'] }) }} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteBourse} onClose={() => setDeleteBourse(null)} onConfirm={() => deleteMutation.mutate(deleteBourse)} title="Supprimer" message="Supprimer cette bourse ?" />
    </div>
  )
}
