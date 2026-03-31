import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck, ExternalLink, X } from 'lucide-react'
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

  // Lock body scroll when open on mobile
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const count = countData?.count || 0

  const handleNotifClick = (notif) => {
    if (!notif.read) markReadMutation.mutate(notif.id)
    if (notif.link) navigate(notif.link)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative p-1.5 rounded-lg hover:bg-surface-100 transition-colors cursor-pointer"
      >
        <Bell size={20} className="text-surface-600" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Fullscreen modal — works on ALL screen sizes */}
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center md:justify-center">
          <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full md:w-[28rem] md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl shadow-xl max-h-[85vh] flex flex-col animate-slide-up md:animate-fade-in">
            {/* Header */}
            <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between flex-shrink-0">
              <h3 className="font-semibold text-surface-900 font-heading">Notifications</h3>
              <div className="flex items-center gap-3">
                {count > 0 && (
                  <button onClick={() => markAllReadMutation.mutate()} className="text-xs text-primary-600 hover:underline flex items-center gap-1 cursor-pointer">
                    <CheckCheck size={14} /> Tout lire
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-surface-100 cursor-pointer">
                  <X size={18} className="text-surface-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="py-16 text-center">
                  <Bell size={32} className="text-surface-200 mx-auto mb-3" />
                  <p className="text-surface-400">Aucune notification</p>
                </div>
              ) : (
                <ul>
                  {notifications.map(notif => (
                    <li
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`px-5 py-4 border-b border-surface-100 cursor-pointer hover:bg-surface-50 transition-colors ${!notif.read ? 'bg-primary-50/40' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${TYPE_COLORS[notif.type] || TYPE_COLORS.info}`} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm ${!notif.read ? 'font-semibold text-surface-900' : 'text-surface-600'}`}>{notif.title}</p>
                          <p className="text-sm text-surface-500 mt-0.5">{notif.message}</p>
                          <p className="text-xs text-surface-400 mt-1.5">{formatRelative(notif.createdAt)}</p>
                        </div>
                        {notif.link && <ExternalLink size={14} className="text-surface-300 mt-1 flex-shrink-0" />}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
