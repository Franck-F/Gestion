import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, FileText, Trash2, Upload, Download, Check, Circle } from 'lucide-react'
import { documentsApi } from '../api/documents.js'
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
import { DOCUMENT_STATUS, DOCUMENT_CATEGORIES } from '../utils/constants.js'
import { formatDate } from '../utils/dateUtils.js'

function DocumentForm({ document: doc, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState({
    name: doc?.name || '', category: doc?.category || '', status: doc?.status || 'A_FAIRE', notes: doc?.notes || '',
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (doc) { await documentsApi.update(doc.id, form) }
      else { await documentsApi.create(form) }
      toast(doc ? 'Document mis à jour' : 'Document créé', 'success')
      onSuccess?.()
    } catch { toast('Erreur', 'error') }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Nom du document" value={form.name} onChange={set('name')} required placeholder="ex: CV, Lettre de motivation" />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Catégorie" value={form.category} onChange={set('category')} options={DOCUMENT_CATEGORIES} placeholder="Choisir..." />
        <Select label="Statut" value={form.status} onChange={set('status')} options={Object.entries(DOCUMENT_STATUS).map(([v, { label }]) => ({ value: v, label }))} />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-surface-700">Notes</label>
        <textarea rows={2} className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" value={form.notes} onChange={set('notes')} />
      </div>
      <div className="flex justify-end"><Button type="submit">{doc ? 'Modifier' : 'Créer'}</Button></div>
    </form>
  )
}

export function DocumentsPage() {
  const [showForm, setShowForm] = useState(false)
  const [editDoc, setEditDoc] = useState(null)
  const [expandedDoc, setExpandedDoc] = useState(null)
  const [deleteDoc, setDeleteDoc] = useState(null)
  const [filter, setFilter] = useState('')
  const queryClient = useQueryClient()
  const toast = useToast()

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', { status: filter || undefined }],
    queryFn: () => documentsApi.list({ status: filter || undefined }).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => documentsApi.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['documents'] }); toast('Document supprimé') },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => documentsApi.update(id, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['documents'] }); toast('Statut mis à jour') },
  })

  const uploadMutation = useMutation({
    mutationFn: ({ id, file, label }) => documentsApi.addVersion(id, file, label),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['documents'] }); toast('Version uploadée') },
  })

  const deleteVersionMutation = useMutation({
    mutationFn: ({ docId, versionId }) => documentsApi.deleteVersion(docId, versionId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['documents'] }); toast('Version supprimée') },
  })

  if (isLoading) return <PageSpinner />

  const ready = documents.filter(d => d.status === 'PRET').length
  const total = documents.length

  return (
    <div>
      <PageHeader
        title="Documents"
        description={`${ready}/${total} prêts`}
        action={<Button size="sm" onClick={() => { setEditDoc(null); setShowForm(true) }}><Plus size={16} /> Ajouter</Button>}
      />

      {total > 0 && (
        <Card className="mb-6 p-5">
          <ProgressBar value={ready} max={total} />
          <div className="flex gap-2 mt-3">
            <Button variant={filter === '' ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter('')}>Tous ({total})</Button>
            {Object.entries(DOCUMENT_STATUS).map(([v, { label }]) => {
              const count = documents.filter(d => d.status === v).length
              return <Button key={v} variant={filter === v ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter(filter === v ? '' : v)}>{label} ({count})</Button>
            })}
          </div>
        </Card>
      )}

      {documents.length === 0 && !filter ? (
        <EmptyState icon={FileText} title="Aucun document" description="Créez votre checklist de documents à préparer" actionLabel="Ajouter un document" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-3">
          {documents.map(doc => {
            const dsc = DOCUMENT_STATUS[doc.status]
            const isExpanded = expandedDoc === doc.id
            return (
              <Card key={doc.id} className="overflow-hidden">
                <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const next = doc.status === 'A_FAIRE' ? 'EN_COURS' : doc.status === 'EN_COURS' ? 'PRET' : 'A_FAIRE'
                      statusMutation.mutate({ id: doc.id, status: next })
                    }}
                    className="cursor-pointer"
                  >
                    {doc.status === 'PRET' ? <Check size={20} className="text-success-500" /> : <Circle size={20} className="text-surface-300" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${doc.status === 'PRET' ? 'text-surface-400 line-through' : 'text-surface-800'}`}>{doc.name}</p>
                    {doc.category && <p className="text-xs text-surface-400">{DOCUMENT_CATEGORIES.find(c => c.value === doc.category)?.label}</p>}
                  </div>
                  <Badge className={dsc.color}>{dsc.label}</Badge>
                  <span className="text-xs text-surface-400">{doc.versions?.length || 0} version(s)</span>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditDoc(doc); setShowForm(true) }}><FileText size={14} /></Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteDoc(doc.id) }}><Trash2 size={14} /></Button>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-surface-100 pt-3">
                    {doc.notes && <p className="text-sm text-surface-500 mb-3">{doc.notes}</p>}
                    <div className="space-y-2">
                      {doc.versions?.map(v => (
                        <div key={v.id} className="flex items-center justify-between p-2 rounded-lg bg-surface-50 text-sm">
                          <div>
                            <span className="font-medium text-surface-700">{v.versionLabel}</span>
                            <span className="text-surface-400 ml-2">{v.fileName}</span>
                            <span className="text-surface-400 ml-2 text-xs">{formatDate(v.createdAt)}</span>
                          </div>
                          <div className="flex gap-1">
                            <a href={v.url || `/uploads/${v.filePath}`} target="_blank" rel="noopener noreferrer" download={v.fileName} className="p-1 hover:bg-surface-200 rounded">
                              <Download size={14} className="text-surface-500" />
                            </a>
                            <button onClick={() => deleteVersionMutation.mutate({ docId: doc.id, versionId: v.id })} className="p-1 hover:bg-danger-50 rounded cursor-pointer">
                              <Trash2 size={14} className="text-surface-400" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <label className="mt-3 flex items-center gap-2 p-3 border-2 border-dashed border-surface-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors">
                      <Upload size={18} className="text-surface-400" />
                      <span className="text-sm text-surface-500">Uploader une nouvelle version</span>
                      <input type="file" className="hidden" onChange={(e) => {
                        if (e.target.files[0]) {
                          const label = `v${(doc.versions?.length || 0) + 1}`
                          uploadMutation.mutate({ id: doc.id, file: e.target.files[0], label })
                        }
                      }} />
                    </label>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editDoc ? 'Modifier le document' : 'Nouveau document'}>
        <DocumentForm document={editDoc} onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['documents'] }) }} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteDoc} onClose={() => setDeleteDoc(null)} onConfirm={() => deleteMutation.mutate(deleteDoc)} title="Supprimer" message="Supprimer ce document et toutes ses versions ?" />
    </div>
  )
}
