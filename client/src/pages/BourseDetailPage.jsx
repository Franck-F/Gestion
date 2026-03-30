import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, Trash2, Plus, ExternalLink, Check, Circle } from 'lucide-react'
import { boursesApi } from '../api/bourses.js'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Card, CardBody } from '../components/ui/Card.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { PageSpinner } from '../components/ui/Spinner.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Select } from '../components/ui/Select.jsx'
import { ProgressBar } from '../components/ui/ProgressBar.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { BOURSE_STATUS, DOCUMENT_STATUS } from '../utils/constants.js'
import { formatDate, formatDeadline } from '../utils/dateUtils.js'

export function BourseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [showDelete, setShowDelete] = useState(false)
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [newDocName, setNewDocName] = useState('')

  const { data: bourse, isLoading } = useQuery({
    queryKey: ['bourse', id],
    queryFn: () => boursesApi.getOne(id).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: () => boursesApi.remove(id),
    onSuccess: () => { toast('Bourse supprimée'); navigate('/bourses') },
  })

  const addDocMutation = useMutation({
    mutationFn: (data) => boursesApi.addDoc(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bourse', id] }); setShowAddDoc(false); setNewDocName(''); toast('Document ajouté') },
  })

  const updateDocMutation = useMutation({
    mutationFn: ({ docId, data }) => boursesApi.updateDoc(id, docId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bourse', id] }); toast('Document mis à jour') },
  })

  const deleteDocMutation = useMutation({
    mutationFn: (docId) => boursesApi.removeDoc(id, docId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bourse', id] }); toast('Document retiré') },
  })

  if (isLoading) return <PageSpinner />
  if (!bourse) return <p>Bourse non trouvée</p>

  const sc = BOURSE_STATUS[bourse.status]
  const docsReady = bourse.requiredDocs?.filter(d => d.status === 'PRET').length || 0
  const docsTotal = bourse.requiredDocs?.length || 0

  return (
    <div>
      <button onClick={() => navigate('/bourses')} className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 mb-4 cursor-pointer">
        <ArrowLeft size={16} /> Retour
      </button>

      <PageHeader
        title={bourse.name}
        description={bourse.organism}
        action={
          <div className="flex gap-2">
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}><Trash2 size={16} /></Button>
          </div>
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-surface-400">Statut</p><Badge className={`mt-1 ${sc.color}`}>{sc.label}</Badge></div>
                <div><p className="text-xs text-surface-400">Montant</p><p className="text-sm text-surface-700 mt-1">{bourse.amount ? `${parseFloat(bourse.amount).toLocaleString()}€` : '—'}</p></div>
                <div><p className="text-xs text-surface-400">Date limite</p><p className="text-sm text-surface-700 mt-1">{bourse.deadline ? formatDeadline(bourse.deadline) : '—'}</p></div>
                <div><p className="text-xs text-surface-400">Type</p><p className="text-sm text-surface-700 mt-1">{bourse.type || '—'}</p></div>
              </div>
              {bourse.applicationUrl && (
                <a href={bourse.applicationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-4 text-sm text-primary-600 hover:underline">
                  Postuler <ExternalLink size={14} />
                </a>
              )}
              {bourse.eligibility && (
                <div className="mt-4 pt-4 border-t border-surface-100">
                  <p className="text-xs text-surface-400 mb-1">Éligibilité</p>
                  <p className="text-sm text-surface-600 whitespace-pre-wrap">{bourse.eligibility}</p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-surface-800 font-heading">Documents requis</h3>
                {docsTotal > 0 && (
                  <div className="mt-2"><ProgressBar value={docsReady} max={docsTotal} /></div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowAddDoc(true)}><Plus size={16} /></Button>
            </div>
            <CardBody>
              {docsTotal === 0 ? (
                <p className="text-sm text-surface-400">Aucun document requis ajouté</p>
              ) : (
                <ul className="space-y-2">
                  {bourse.requiredDocs.map(doc => {
                    const dsc = DOCUMENT_STATUS[doc.status]
                    return (
                      <li key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-50">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const next = doc.status === 'A_FAIRE' ? 'EN_COURS' : doc.status === 'EN_COURS' ? 'PRET' : 'A_FAIRE'
                              updateDocMutation.mutate({ docId: doc.id, data: { status: next } })
                            }}
                            className="cursor-pointer"
                          >
                            {doc.status === 'PRET' ? <Check size={18} className="text-success-500" /> : <Circle size={18} className="text-surface-300" />}
                          </button>
                          <div>
                            <p className="text-sm text-surface-700">{doc.name}</p>
                            <Badge className={`mt-0.5 ${dsc.color}`}>{dsc.label}</Badge>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteDocMutation.mutate(doc.id)}><Trash2 size={14} /></Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal isOpen={showAddDoc} onClose={() => setShowAddDoc(false)} title="Ajouter un document requis" size="sm">
        <form onSubmit={(e) => { e.preventDefault(); addDocMutation.mutate({ name: newDocName }) }} className="space-y-4">
          <Input label="Nom du document" value={newDocName} onChange={e => setNewDocName(e.target.value)} required placeholder="ex: Avis d'imposition" />
          <div className="flex justify-end"><Button type="submit">Ajouter</Button></div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => deleteMutation.mutate()} title="Supprimer" message="Supprimer cette bourse et ses documents ?" />
    </div>
  )
}
