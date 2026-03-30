import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, Trash2, UserPlus, Plus, ExternalLink } from 'lucide-react'
import { candidaturesApi } from '../api/candidatures.js'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Card, CardBody } from '../components/ui/Card.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { PageSpinner } from '../components/ui/Spinner.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { CandidatureForm } from '../components/candidatures/CandidatureForm.jsx'
import { CANDIDATURE_STATUS } from '../utils/constants.js'
import { formatDate, formatRelative } from '../utils/dateUtils.js'
import { Input } from '../components/ui/Input.jsx'

function ContactForm({ candidatureId, contact, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState({
    name: contact?.name || '', role: contact?.role || '', email: contact?.email || '',
    phone: contact?.phone || '', linkedinUrl: contact?.linkedinUrl || '', notes: contact?.notes || '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (contact) {
        await candidaturesApi.updateContact(candidatureId, contact.id, form)
      } else {
        await candidaturesApi.createContact(candidatureId, form)
      }
      toast(contact ? 'Contact mis à jour' : 'Contact ajouté', 'success')
      onSuccess?.()
    } catch { toast('Erreur', 'error') }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Nom" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <Input label="Rôle" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Input label="Téléphone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
      </div>
      <Input label="LinkedIn" value={form.linkedinUrl} onChange={e => setForm({ ...form, linkedinUrl: e.target.value })} />
      <div className="flex justify-end pt-2">
        <Button type="submit">{contact ? 'Modifier' : 'Ajouter'}</Button>
      </div>
    </form>
  )
}

export function CandidatureDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  const { data: candidature, isLoading } = useQuery({
    queryKey: ['candidature', id],
    queryFn: () => candidaturesApi.getOne(id).then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: () => candidaturesApi.remove(id),
    onSuccess: () => { toast('Candidature supprimée', 'success'); navigate('/candidatures') },
  })

  const deleteContactMutation = useMutation({
    mutationFn: (contactId) => candidaturesApi.deleteContact(id, contactId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['candidature', id] }); toast('Contact supprimé') },
  })

  if (isLoading) return <PageSpinner />
  if (!candidature) return <p>Candidature non trouvée</p>

  const statusConfig = CANDIDATURE_STATUS[candidature.status]

  return (
    <div>
      <button onClick={() => navigate('/candidatures')} className="flex items-center gap-1 text-sm text-surface-500 hover:text-surface-700 mb-4 cursor-pointer">
        <ArrowLeft size={16} /> Retour
      </button>

      <PageHeader
        title={candidature.companyName}
        description={candidature.jobTitle}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}><Edit size={16} /></Button>
            <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}><Trash2 size={16} /></Button>
          </div>
        }
      />

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardBody>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-surface-400">Statut</p>
                  <Badge className={`mt-1 ${statusConfig.color}`} dot={statusConfig.dot}>{statusConfig.label}</Badge>
                </div>
                <div>
                  <p className="text-xs text-surface-400">Lieu</p>
                  <p className="text-sm text-surface-700 mt-1">{candidature.location || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-400">Salaire</p>
                  <p className="text-sm text-surface-700 mt-1">{candidature.salary || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-surface-400">Postulé le</p>
                  <p className="text-sm text-surface-700 mt-1">{candidature.appliedAt ? formatDate(candidature.appliedAt) : '—'}</p>
                </div>
              </div>
              {candidature.jobUrl && (
                <a href={candidature.jobUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-4 text-sm text-primary-600 hover:underline">
                  Voir l'offre <ExternalLink size={14} />
                </a>
              )}
              {candidature.description && (
                <div className="mt-4 pt-4 border-t border-surface-100">
                  <p className="text-sm text-surface-600 whitespace-pre-wrap">{candidature.description}</p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
              <h3 className="font-semibold text-surface-800 font-heading">Contacts</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowContactForm(true)}>
                <UserPlus size={16} /> Ajouter
              </Button>
            </div>
            <CardBody>
              {candidature.contacts?.length === 0 ? (
                <p className="text-sm text-surface-400">Aucun contact</p>
              ) : (
                <ul className="space-y-3">
                  {candidature.contacts?.map(contact => (
                    <li key={contact.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-50">
                      <div>
                        <p className="text-sm font-medium text-surface-800">{contact.name}</p>
                        <p className="text-xs text-surface-500">{contact.role} {contact.email && `· ${contact.email}`}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteContactMutation.mutate(contact.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>

        <div>
          <Card>
            <div className="px-5 py-4 border-b border-surface-100">
              <h3 className="font-semibold text-surface-800 font-heading">Historique</h3>
            </div>
            <CardBody>
              {candidature.activities?.length === 0 ? (
                <p className="text-sm text-surface-400">Aucune activité</p>
              ) : (
                <ul className="space-y-3">
                  {candidature.activities?.map(a => (
                    <li key={a.id} className="border-l-2 border-surface-200 pl-3">
                      <p className="text-sm text-surface-700">{a.description}</p>
                      <p className="text-xs text-surface-400">{formatRelative(a.date)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier la candidature" size="lg">
        <CandidatureForm candidature={candidature} onSuccess={() => { setShowEdit(false); queryClient.invalidateQueries({ queryKey: ['candidature', id] }) }} />
      </Modal>

      <Modal isOpen={showContactForm} onClose={() => setShowContactForm(false)} title="Ajouter un contact">
        <ContactForm candidatureId={id} onSuccess={() => { setShowContactForm(false); queryClient.invalidateQueries({ queryKey: ['candidature', id] }) }} />
      </Modal>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Supprimer la candidature"
        message={`Êtes-vous sûr de vouloir supprimer la candidature chez ${candidature.companyName} ? Cette action est irréversible.`}
      />
    </div>
  )
}
