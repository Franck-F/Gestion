import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { notificationsApi } from '../../api/notifications.js'
import { formatRelative } from '../../utils/dateUtils.js'

const TYPE_COLORS = {
  followup: 'bg-primary-500',
  deadline: 'bg-accent-500',
  checkin: 'bg-warning-500',
  info: 'bg-surface-400',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: countData } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: () => notificationsApi.unreadCount().then(r => r.data),
    refetchInterval: 30000,
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsApi.list().then(r => r.data),
    enabled: open,
  })

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  // Close on click outside
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const count = countData?.count || 0

  const handleClick = (notif) => {
    if (!notif.read) markReadMutation.mutate(notif.id)
    if (notif.link) { navigate(notif.link); setOpen(false) }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
      >
        <Bell size={20} className="text-surface-600" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-surface-200 z-50 max-h-[70vh] flex flex-col">
          <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
            <h3 className="font-semibold text-surface-800 text-sm">Notifications</h3>
            {count > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs text-primary-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={14} /> Tout marquer comme lu
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell size={24} className="text-surface-300 mx-auto mb-2" />
                <p className="text-sm text-surface-400">Aucune notification</p>
              </div>
            ) : (
              <ul>
                {notifications.map(notif => (
                  <li
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className={`px-4 py-3 border-b border-surface-50 cursor-pointer hover:bg-surface-50 transition-colors ${!notif.read ? 'bg-primary-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${TYPE_COLORS[notif.type] || TYPE_COLORS.info}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${!notif.read ? 'font-semibold text-surface-800' : 'text-surface-600'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-xs text-surface-400 mt-1">{formatRelative(notif.createdAt)}</p>
                      </div>
                      {notif.link && <ExternalLink size={14} className="text-surface-300 mt-1 flex-shrink-0" />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
