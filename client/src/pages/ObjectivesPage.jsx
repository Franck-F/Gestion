import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Target, Trash2, Check, Circle, Flame, ChevronDown, ChevronUp } from 'lucide-react'
import { objectivesApi } from '../api/objectives.js'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Card, CardBody } from '../components/ui/Card.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { PageSpinner } from '../components/ui/Spinner.jsx'
import { ProgressBar } from '../components/ui/ProgressBar.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Select } from '../components/ui/Select.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { OBJECTIVE_STATUS, OBJECTIVE_CATEGORIES } from '../utils/constants.js'
import { formatDate } from '../utils/dateUtils.js'

function ObjectiveForm({ objective, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState({
    title: objective?.title || '', description: objective?.description || '',
    category: objective?.category || '', targetDate: objective?.targetDate ? new Date(objective.targetDate).toISOString().slice(0, 16) : '',
    specific: objective?.specific || '', measurable: objective?.measurable || '',
    achievable: objective?.achievable || '', relevant: objective?.relevant || '', timeBound: objective?.timeBound || '',
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...form, targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : null }
      if (objective) { await objectivesApi.update(objective.id, data) }
      else { await objectivesApi.create(data) }
      toast(objective ? 'Objectif mis à jour' : 'Objectif créé', 'success')
      onSuccess?.()
    } catch { toast('Erreur', 'error') }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Titre" value={form.title} onChange={set('title')} required />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Catégorie" value={form.category} onChange={set('category')} options={OBJECTIVE_CATEGORIES} placeholder="Choisir..." />
        <Input label="Date cible" type="datetime-local" value={form.targetDate} onChange={set('targetDate')} />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-surface-700">Description</label>
        <textarea rows={2} className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" value={form.description} onChange={set('description')} />
      </div>
      <details className="group">
        <summary className="text-sm font-medium text-primary-600 cursor-pointer flex items-center gap-1">
          Critères SMART <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
        </summary>
        <div className="mt-3 space-y-3">
          <Input label="Spécifique" value={form.specific} onChange={set('specific')} placeholder="Quoi exactement ?" />
          <Input label="Mesurable" value={form.measurable} onChange={set('measurable')} placeholder="Comment mesurer ?" />
          <Input label="Atteignable" value={form.achievable} onChange={set('achievable')} placeholder="Est-ce réaliste ?" />
          <Input label="Pertinent" value={form.relevant} onChange={set('relevant')} placeholder="Pourquoi ?" />
          <Input label="Temporel" value={form.timeBound} onChange={set('timeBound')} placeholder="Quelle échéance ?" />
        </div>
      </details>
      <div className="flex justify-end"><Button type="submit">{objective ? 'Modifier' : 'Créer'}</Button></div>
    </form>
  )
}

export function ObjectivesPage() {
  const [showForm, setShowForm] = useState(false)
  const [editObj, setEditObj] = useState(null)
  const [deleteObj, setDeleteObj] = useState(null)
  const [newMilestone, setNewMilestone] = useState({})
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: objectives = [], isLoading } = useQuery({
    queryKey: ['objectives'],
    queryFn: () => objectivesApi.list().then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => objectivesApi.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['objectives'] }); toast('Objectif supprimé') },
  })

  const checkInMutation = useMutation({
    mutationFn: (id) => objectivesApi.checkIn(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['objectives'] }); toast('Check-in enregistré !') },
  })

  const addMilestoneMutation = useMutation({
    mutationFn: ({ id, title }) => objectivesApi.createMilestone(id, { title }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['objectives'] }),
  })

  const toggleMilestoneMutation = useMutation({
    mutationFn: ({ objId, milestoneId, completed }) => objectivesApi.updateMilestone(objId, milestoneId, { completed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['objectives'] }),
  })

  const deleteMilestoneMutation = useMutation({
    mutationFn: ({ objId, milestoneId }) => objectivesApi.deleteMilestone(objId, milestoneId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['objectives'] }),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <PageHeader
        title="Objectifs"
        description={`${objectives.length} objectif(s)`}
        action={<Button size="sm" onClick={() => { setEditObj(null); setShowForm(true) }}><Plus size={16} /> Ajouter</Button>}
      />

      {objectives.length === 0 ? (
        <EmptyState icon={Target} title="Aucun objectif" description="Définissez vos objectifs SMART" actionLabel="Créer un objectif" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-4">
          {objectives.map(obj => {
            const sc = OBJECTIVE_STATUS[obj.status]
            const totalMs = obj.milestones?.length || 0
            const doneMs = obj.milestones?.filter(m => m.completed).length || 0
            return (
              <Card key={obj.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-surface-800 truncate">{obj.title}</p>
                      <Badge className={sc.color}>{sc.label}</Badge>
                    </div>
                    {obj.description && <p className="text-xs text-surface-500 mt-1">{obj.description}</p>}
                    {obj.targetDate && <p className="text-xs text-surface-400 mt-1">Cible: {formatDate(obj.targetDate)}</p>}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {obj.streakCurrent > 0 && (
                      <div className="flex items-center gap-1 text-accent-500">
                        <Flame size={16} />
                        <span className="text-sm font-bold">{obj.streakCurrent}</span>
                      </div>
                    )}
                    <Button variant="accent" size="sm" onClick={() => checkInMutation.mutate(obj.id)}>Check-in</Button>
                    <Button variant="ghost" size="sm" onClick={() => { setEditObj(obj); setShowForm(true) }}><ChevronUp size={14} /></Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteObj(obj.id)}><Trash2 size={14} /></Button>
                  </div>
                </div>

                {totalMs > 0 && (
                  <div className="mt-3">
                    <ProgressBar value={doneMs} max={totalMs} color="bg-accent-500" />
                    <p className="text-xs text-surface-400 mt-1">{doneMs}/{totalMs} étapes</p>
                  </div>
                )}

                <ul className="mt-3 space-y-1">
                  {obj.milestones?.map(ms => (
                    <li key={ms.id} className="flex items-center gap-2 group">
                      <button onClick={() => toggleMilestoneMutation.mutate({ objId: obj.id, milestoneId: ms.id, completed: !ms.completed })} className="cursor-pointer">
                        {ms.completed ? <Check size={16} className="text-success-500" /> : <Circle size={16} className="text-surface-300" />}
                      </button>
                      <span className={`text-sm flex-1 ${ms.completed ? 'line-through text-surface-400' : 'text-surface-700'}`}>{ms.title}</span>
                      <button onClick={() => deleteMilestoneMutation.mutate({ objId: obj.id, milestoneId: ms.id })} className="opacity-0 group-hover:opacity-100 cursor-pointer"><Trash2 size={12} className="text-surface-400" /></button>
                    </li>
                  ))}
                </ul>

                <form className="mt-3 flex gap-2" onSubmit={(e) => {
                  e.preventDefault()
                  const title = newMilestone[obj.id]
                  if (title?.trim()) { addMilestoneMutation.mutate({ id: obj.id, title }); setNewMilestone({ ...newMilestone, [obj.id]: '' }) }
                }}>
                  <input
                    className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-surface-200 focus:border-primary-400 focus:outline-none"
                    placeholder="Nouvelle étape..."
                    value={newMilestone[obj.id] || ''}
                    onChange={e => setNewMilestone({ ...newMilestone, [obj.id]: e.target.value })}
                  />
                  <Button type="submit" size="sm" variant="secondary"><Plus size={14} /></Button>
                </form>
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editObj ? 'Modifier l\'objectif' : 'Nouvel objectif'} size="lg">
        <ObjectiveForm objective={editObj} onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['objectives'] }) }} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteObj} onClose={() => setDeleteObj(null)} onConfirm={() => deleteMutation.mutate(deleteObj)} title="Supprimer" message="Supprimer cet objectif et ses jalons ?" />
    </div>
  )
}
