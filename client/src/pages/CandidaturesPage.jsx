import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, BarChart3 } from 'lucide-react'
import { candidaturesApi } from '../api/candidatures.js'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Card } from '../components/ui/Card.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { PageSpinner } from '../components/ui/Spinner.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { CANDIDATURE_STATUS, CANDIDATURE_COLUMNS } from '../utils/constants.js'
import { formatDate, formatRelative } from '../utils/dateUtils.js'
import { CandidatureForm } from '../components/candidatures/CandidatureForm.jsx'
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'

function DraggableCard({ candidature }) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidature.id,
    data: { status: candidature.status },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        hover
        className="p-4 mb-3 cursor-grab active:cursor-grabbing"
        onClick={() => navigate(`/candidatures/${candidature.id}`)}
      >
        <p className="font-medium text-sm text-surface-800 truncate">{candidature.companyName}</p>
        <p className="text-xs text-surface-500 mt-0.5 truncate">{candidature.jobTitle}</p>
        {candidature.location && (
          <p className="text-xs text-surface-400 mt-1">{candidature.location}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          {candidature.appliedAt && (
            <span className="text-xs text-surface-400">{formatDate(candidature.appliedAt)}</span>
          )}
          {candidature.contacts?.length > 0 && (
            <span className="text-xs text-surface-400">{candidature.contacts.length} contact(s)</span>
          )}
        </div>
      </Card>
    </div>
  )
}

function KanbanColumn({ status, candidatures, onDragOver }) {
  const statusConfig = CANDIDATURE_STATUS[status]
  const items = candidatures.filter(c => c.status === status)

  return (
    <div className="flex-shrink-0 w-72 md:w-auto md:flex-1">
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
        <h3 className="text-sm font-semibold text-surface-700">{statusConfig.label}</h3>
        <span className="text-xs text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="min-h-[200px] rounded-xl bg-surface-50 p-2 border border-dashed border-surface-200">
        {items.map(c => (
          <DraggableCard key={c.id} candidature={c} />
        ))}
      </div>
    </div>
  )
}

export function CandidaturesPage() {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [showStats, setShowStats] = useState(false)
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: candidatures = [], isLoading } = useQuery({
    queryKey: ['candidatures', { search }],
    queryFn: () => candidaturesApi.list({ search: search || undefined }).then(r => r.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['candidatures', 'stats'],
    queryFn: () => candidaturesApi.getStats().then(r => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => candidaturesApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidatures'] })
      toast('Statut mis à jour', 'success')
    },
  })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragEnd(event) {
    const { active, over } = event
    if (!over) return

    const candidature = candidatures.find(c => c.id === active.id)
    if (!candidature) return

    // Determine target column from drop target
    const overCandidature = candidatures.find(c => c.id === over.id)
    const targetStatus = overCandidature?.status

    if (targetStatus && targetStatus !== candidature.status) {
      statusMutation.mutate({ id: candidature.id, status: targetStatus })
    }
  }

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <PageHeader
        title="Alternance"
        description={`${candidatures.length} candidature(s)`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowStats(!showStats)}>
              <BarChart3 size={16} />
              <span className="hidden md:inline">Stats</span>
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Ajouter
            </Button>
          </div>
        }
      />

      {showStats && stats && (
        <Card className="mb-6 p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-surface-400">Total</p>
              <p className="text-xl font-bold text-surface-800">{stats.total}</p>
            </div>
            <div>
              <p className="text-xs text-surface-400">Cette semaine</p>
              <p className="text-xl font-bold text-primary-600">{stats.thisWeek}</p>
            </div>
            <div>
              <p className="text-xs text-surface-400">Taux de réponse</p>
              <p className="text-xl font-bold text-accent-600">{stats.responseRate}%</p>
            </div>
            <div>
              <p className="text-xs text-surface-400">En entretien</p>
              <p className="text-xl font-bold text-warning-600">{stats.byStatus?.ENTRETIEN || 0}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="mb-4">
        <Input
          placeholder="Rechercher une entreprise, poste..."
          icon={Search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {candidatures.length === 0 && !search ? (
        <EmptyState
          icon={Briefcase}
          title="Aucune candidature"
          description="Commencez par ajouter votre première candidature"
          actionLabel="Ajouter une candidature"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {CANDIDATURE_COLUMNS.map(status => (
              <KanbanColumn key={status} status={status} candidatures={candidatures} />
            ))}
          </div>
        </DndContext>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nouvelle candidature" size="lg">
        <CandidatureForm onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['candidatures'] }) }} />
      </Modal>
    </div>
  )
}
