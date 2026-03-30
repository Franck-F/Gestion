import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Calendar, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { eventsApi } from '../api/events.js'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Card, CardBody } from '../components/ui/Card.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { EmptyState } from '../components/ui/EmptyState.jsx'
import { PageSpinner } from '../components/ui/Spinner.jsx'
import { ConfirmDialog } from '../components/ui/ConfirmDialog.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

function EventForm({ event, onSuccess }) {
  const toast = useToast()
  const [form, setForm] = useState({
    title: event?.title || '', description: event?.description || '',
    startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
    endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
    allDay: event?.allDay || false, color: event?.color || '#3b97f6',
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...form, startDate: new Date(form.startDate).toISOString(), endDate: form.endDate ? new Date(form.endDate).toISOString() : null }
      if (event) { await eventsApi.update(event.id, data) }
      else { await eventsApi.create(data) }
      toast(event ? 'Événement mis à jour' : 'Événement créé', 'success')
      onSuccess?.()
    } catch { toast('Erreur', 'error') }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Titre" value={form.title} onChange={set('title')} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Début" type="datetime-local" value={form.startDate} onChange={set('startDate')} required />
        <Input label="Fin (optionnel)" type="datetime-local" value={form.endDate} onChange={set('endDate')} />
      </div>
      <div className="flex items-center gap-3">
        <input type="color" value={form.color} onChange={set('color')} className="w-8 h-8 rounded cursor-pointer" />
        <label className="flex items-center gap-2 text-sm text-surface-600">
          <input type="checkbox" checked={form.allDay} onChange={e => setForm({ ...form, allDay: e.target.checked })} className="rounded" /> Toute la journée
        </label>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-surface-700">Description</label>
        <textarea rows={2} className="w-full rounded-lg border border-surface-200 bg-white px-3.5 py-2.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100" value={form.description} onChange={set('description')} />
      </div>
      <div className="flex justify-end"><Button type="submit">{event ? 'Modifier' : 'Créer'}</Button></div>
    </form>
  )
}

export function AgendaPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showForm, setShowForm] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [deleteEvent, setDeleteEvent] = useState(null)
  const queryClient = useQueryClient()
  const toast = useToast()

  const start = startOfMonth(currentMonth)
  const end = endOfMonth(currentMonth)

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events', format(start, 'yyyy-MM'), format(end, 'yyyy-MM')],
    queryFn: () => eventsApi.list({ start: start.toISOString(), end: end.toISOString() }).then(r => r.data),
  })

  const { data: deadlines = [] } = useQuery({
    queryKey: ['events', 'deadlines'],
    queryFn: () => eventsApi.getDeadlines().then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => eventsApi.remove(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['events'] }); toast('Événement supprimé') },
  })

  const days = useMemo(() => eachDayOfInterval({ start, end }), [start, end])
  const startDow = start.getDay() || 7
  const paddingDays = Array.from({ length: startDow - 1 })

  const allEvents = useMemo(() => [
    ...events,
    ...deadlines.map(d => ({ ...d, startDate: d.date, color: d.source === 'CANDIDATURE' ? '#3b97f6' : d.source === 'BOURSE' ? '#ff5722' : '#f59e0b', isDeadline: true })),
  ], [events, deadlines])

  const dayEvents = (day) => allEvents.filter(e => isSameDay(new Date(e.startDate), day))
  const selectedDayEvents = selectedDay ? dayEvents(selectedDay) : []

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <PageHeader
        title="Agenda"
        action={<Button size="sm" onClick={() => setShowForm(true)}><Plus size={16} /> Événement</Button>}
      />

      <Card className="mb-6">
        <div className="px-5 py-4 flex items-center justify-between border-b border-surface-100">
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={18} /></Button>
          <h2 className="font-semibold text-surface-800 font-heading capitalize">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</h2>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={18} /></Button>
        </div>
        <CardBody>
          <div className="grid grid-cols-7 gap-px mb-1">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
              <div key={d} className="text-xs font-medium text-surface-400 text-center py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
            {paddingDays.map((_, i) => <div key={`p-${i}`} />)}
            {days.map(day => {
              const evts = dayEvents(day)
              const isSelected = selectedDay && isSameDay(day, selectedDay)
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`p-2 min-h-[60px] md:min-h-[80px] text-left rounded-lg transition-colors cursor-pointer ${
                    isToday(day) ? 'bg-primary-50 ring-1 ring-primary-200' :
                    isSelected ? 'bg-surface-100' : 'hover:bg-surface-50'
                  }`}
                >
                  <span className={`text-sm ${isToday(day) ? 'font-bold text-primary-600' : 'text-surface-600'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {evts.slice(0, 3).map((evt, i) => (
                      <div key={i} className="text-xs truncate px-1 py-0.5 rounded" style={{ backgroundColor: `${evt.color}20`, color: evt.color }}>
                        {evt.title}
                      </div>
                    ))}
                    {evts.length > 3 && <p className="text-xs text-surface-400">+{evts.length - 3}</p>}
                  </div>
                </button>
              )
            })}
          </div>
        </CardBody>
      </Card>

      {selectedDay && (
        <Card className="mb-6">
          <div className="px-5 py-4 border-b border-surface-100">
            <h3 className="font-semibold text-surface-800 font-heading">{format(selectedDay, 'EEEE d MMMM', { locale: fr })}</h3>
          </div>
          <CardBody>
            {selectedDayEvents.length === 0 ? (
              <p className="text-sm text-surface-400">Rien de prévu ce jour</p>
            ) : (
              <ul className="space-y-2">
                {selectedDayEvents.map((evt, i) => (
                  <li key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: evt.color }} />
                      <div>
                        <p className="text-sm font-medium text-surface-700">{evt.title}</p>
                        {evt.description && <p className="text-xs text-surface-400">{evt.description}</p>}
                      </div>
                    </div>
                    {!evt.isDeadline && (
                      <Button variant="ghost" size="sm" onClick={() => setDeleteEvent(evt.id)}><Trash2 size={14} /></Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nouvel événement">
        <EventForm onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['events'] }) }} />
      </Modal>

      <ConfirmDialog isOpen={!!deleteEvent} onClose={() => setDeleteEvent(null)} onConfirm={() => deleteMutation.mutate(deleteEvent)} title="Supprimer" message="Supprimer cet événement ?" />
    </div>
  )
}
