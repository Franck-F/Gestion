import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, BookOpen, Search, Pin, Trash2, Edit, Tag } from 'lucide-react'
import { notesApi } from '../api/notes.js'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Card, CardBody } from '../components/ui/Card.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { PageSpinner } from '../components/ui/Spinner.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Select } from '../components/ui/Select.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { NOTE_TYPES } from '../utils/constants.js'
import { formatRelative } from '../utils/dateUtils.js'

function NoteForm({ note, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState({
    title: note?.title || '', content: note?.content || '',
    type: note?.type || 'free', tags: note?.tags?.join(', ') || '',
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] }
      if (note) { await notesApi.update(note.id, data) }
      else { await notesApi.create(data) }
      toast(note ? 'Note mise à jour' : 'Note créée', 'success')
      onSuccess?.()
    } catch { toast('Erreur', 'error') }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Titre" value={form.title} onChange={set('title')} required />
      <Select label="Type" value={form.type} onChange={set('type')} options={NOTE_TYPES} />
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-surface-700">Contenu</label>
        <textarea
          rows={10}
          className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 text-sm font-mono focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
          value={form.content}
          onChange={set('content')}
          placeholder="Écrivez en Markdown..."
          required
        />
      </div>
      <Input label="Tags (séparés par des virgules)" value={form.tags} onChange={set('tags')} placeholder="entretien, google, technique" />
      <div className="flex justify-end"><Button type="submit">{note ? 'Modifier' : 'Créer'}</Button></div>
    </form>
  )
}

export function JournalPage() {
  const [showForm, setShowForm] = useState(false)
  const [editNote, setEditNote] = useState(null)
  const [deleteNote, setDeleteNote] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ['notes', { search: search || undefined, type: typeFilter || undefined }],
    queryFn: () => notesApi.list({ search: search || undefined, type: typeFilter || undefined }).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => notesApi.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notes'] }); toast('Note supprimée') },
  })

  const pinMutation = useMutation({
    mutationFn: (id) => notesApi.togglePin(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['notes'] }); toast('Épingle mise à jour') },
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <PageHeader
        title="Journal"
        description={`${notes.length} note(s)`}
        action={<Button size="sm" onClick={() => { setEditNote(null); setShowForm(true) }}><Plus size={16} /> Nouvelle note</Button>}
      />

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Rechercher..." icon={Search} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          options={NOTE_TYPES}
          placeholder="Tous les types"
          className="w-auto"
        />
      </div>

      {notes.length === 0 && !search && !typeFilter ? (
        <EmptyState icon={BookOpen} title="Aucune note" description="Commencez à documenter vos démarches" actionLabel="Nouvelle note" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <Card key={note.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {note.isPinned && <Pin size={14} className="text-accent-500" />}
                    <p className="font-medium text-surface-800 truncate">{note.title}</p>
                  </div>
                  <p className="text-sm text-surface-500 mt-1 line-clamp-2">{note.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-surface-400">{formatRelative(note.updatedAt)}</span>
                    {note.type && <Badge className="bg-surface-100 text-surface-600">{NOTE_TYPES.find(t => t.value === note.type)?.label || note.type}</Badge>}
                    {note.candidature && <Badge className="bg-primary-50 text-primary-600">{note.candidature.companyName}</Badge>}
                    {note.tags?.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-0.5 text-xs text-surface-500">
                        <Tag size={10} />{tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 ml-3">
                  <Button variant="ghost" size="sm" onClick={() => pinMutation.mutate(note.id)}>
                    <Pin size={14} className={note.isPinned ? 'text-accent-500' : ''} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditNote(note); setShowForm(true) }}><Edit size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteNote(note.id)}><Trash2 size={14} /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editNote ? 'Modifier la note' : 'Nouvelle note'} size="lg">
        <NoteForm note={editNote} onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['notes'] }) }} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteNote} onClose={() => setDeleteNote(null)} onConfirm={() => deleteMutation.mutate(deleteNote)} title="Supprimer" message="Supprimer cette note ?" />
    </div>
  )
}
