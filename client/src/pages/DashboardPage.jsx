import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Briefcase, GraduationCap, Target, FileText, ArrowRight,
  Clock, AlertTriangle, Plus, CheckCircle
} from 'lucide-react'
import { dashboardApi } from '../api/dashboard.js'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import { Card, CardBody } from '../components/ui/Card.jsx'
import { ProgressBar } from '../components/ui/ProgressBar.jsx'
import { PageSpinner } from '../components/ui/Spinner.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { formatDeadline, isOverdue } from '../utils/dateUtils.js'
import { useAuth } from '../contexts/AuthContext.jsx'

function QuickAction({ icon: Icon, label, to, color }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 p-2.5 sm:p-4 rounded-xl border border-surface-200 hover:shadow-md transition-all bg-white">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={16} />
      </div>
      <span className="text-[10px] sm:text-xs font-medium text-surface-600 text-center truncate w-full">{label}</span>
    </Link>
  )
}

function StatCard({ icon: Icon, label, value, to, color }) {
  return (
    <Link to={to}>
      <Card hover className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon size={16} className="sm:hidden" /><Icon size={20} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-2xl font-bold font-heading text-surface-900">{value}</p>
            <p className="text-[10px] sm:text-xs text-surface-500 truncate">{label}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export function DashboardPage() {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats().then(r => r.data),
  })

  const { data: deadlines = [] } = useQuery({
    queryKey: ['dashboard', 'deadlines'],
    queryFn: () => dashboardApi.getUpcomingDeadlines().then(r => r.data),
  })

  const { data: activity = [] } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => dashboardApi.getRecentActivity().then(r => r.data),
  })

  if (isLoading) return <PageSpinner />

  const urgentDeadlines = deadlines.filter(d => {
    const days = Math.ceil((new Date(d.date) - new Date()) / (1000 * 60 * 60 * 24))
    return days <= 3
  })

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  }

  return (
    <div>
      <PageHeader title={`${greeting()}, ${user?.firstName}`} />

      {urgentDeadlines.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-warning-50 border border-warning-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-warning-600" />
            <p className="text-sm font-semibold text-warning-700">
              {urgentDeadlines.length} échéance{urgentDeadlines.length > 1 ? 's' : ''} urgente{urgentDeadlines.length > 1 ? 's' : ''}
            </p>
          </div>
          <ul className="space-y-1">
            {urgentDeadlines.slice(0, 3).map((d, i) => (
              <li key={i} className="text-sm text-warning-700 flex items-center justify-between">
                <span className="truncate mr-2">{d.title}</span>
                <span className="text-xs font-medium whitespace-nowrap">{formatDeadline(d.date)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Briefcase} label="Candidatures actives" value={stats?.candidatures?.active || 0} to="/candidatures" color="bg-primary-100 text-primary-600" />
        <StatCard icon={GraduationCap} label="Bourses suivies" value={stats?.bourses?.active || 0} to="/bourses" color="bg-accent-100 text-accent-600" />
        <StatCard icon={Target} label="Objectifs en cours" value={stats?.objectives?.inProgress || 0} to="/objectives" color="bg-warning-50 text-warning-600" />
        <StatCard icon={FileText} label="Documents prêts" value={stats?.documents?.total > 0 ? `${stats.documents.ready}/${stats.documents.total}` : '0'} to="/documents" color="bg-success-50 text-success-600" />
      </div>

      {stats?.documents?.total > 0 && (
        <Card className="mb-6 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-surface-700">Documents prêts</p>
            <Link to="/documents" className="text-xs text-primary-600 hover:underline">{stats.documents.ready}/{stats.documents.total}</Link>
          </div>
          <ProgressBar value={stats.documents.ready} max={stats.documents.total} />
        </Card>
      )}

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-surface-500 uppercase tracking-wider mb-3">Actions rapides</h3>
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          <QuickAction icon={Plus} label="Candidature" to="/candidatures" color="bg-primary-100 text-primary-600" />
          <QuickAction icon={GraduationCap} label="Bourse" to="/bourses" color="bg-accent-100 text-accent-600" />
          <QuickAction icon={Target} label="Objectif" to="/objectives" color="bg-warning-50 text-warning-600" />
          <QuickAction icon={FileText} label="Document" to="/documents" color="bg-success-50 text-success-600" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-surface-400" />
              <h3 className="font-semibold text-surface-800 text-sm">Prochaines échéances</h3>
            </div>
            <Link to="/agenda" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              Voir tout <ArrowRight size={12} />
            </Link>
          </div>
          <CardBody>
            {deadlines.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-4">Aucune échéance prévue</p>
            ) : (
              <ul className="space-y-3">
                {deadlines.slice(0, 5).map((d, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-sm text-surface-700 truncate mr-3">{d.title}</span>
                    <Badge className={isOverdue(d.date) ? 'bg-danger-50 text-danger-600' : 'bg-surface-100 text-surface-600'}>
                      {formatDeadline(d.date)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <div className="px-4 py-3 border-b border-surface-100 flex items-center gap-2">
            <CheckCircle size={16} className="text-surface-400" />
            <h3 className="font-semibold text-surface-800 text-sm">Activité récente</h3>
          </div>
          <CardBody>
            {activity.length === 0 ? (
              <p className="text-sm text-surface-400 text-center py-4">Aucune activité pour le moment</p>
            ) : (
              <ul className="space-y-3">
                {activity.slice(0, 5).map((a, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-surface-700 truncate">{a.description}</p>
                      <p className="text-xs text-surface-400">{formatDeadline(a.date)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
