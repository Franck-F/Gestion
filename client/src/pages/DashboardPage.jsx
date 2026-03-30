import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Briefcase, GraduationCap, Target, FileText, ArrowRight, Clock, Activity } from 'lucide-react'
import { dashboardApi } from '../api/dashboard.js'
import { PageHeader } from '../components/layout/PageHeader.jsx'
import { Card, CardBody } from '../components/ui/Card.jsx'
import { PageSpinner } from '../components/ui/Spinner.jsx'
import { ProgressBar } from '../components/ui/ProgressBar.jsx'
import { formatDeadline, formatRelative } from '../utils/dateUtils.js'
import { useAuth } from '../contexts/AuthContext.jsx'

function StatCard({ icon: Icon, label, value, sub, to, color }) {
  return (
    <Link to={to}>
      <Card hover className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-surface-500">{label}</p>
            <p className="text-2xl font-bold font-heading text-surface-900 mt-1">{value}</p>
            {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={20} />
          </div>
        </div>
      </Card>
    </Link>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats().then(r => r.data),
  })
  const { data: deadlines, isLoading: loadingDeadlines } = useQuery({
    queryKey: ['dashboard', 'deadlines'],
    queryFn: () => dashboardApi.getUpcomingDeadlines().then(r => r.data),
  })
  const { data: activity, isLoading: loadingActivity } = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => dashboardApi.getRecentActivity().then(r => r.data),
  })

  if (loadingStats) return <PageSpinner />

  return (
    <div>
      <PageHeader
        title={`Bonjour, ${user?.firstName} !`}
        description="Voici un aperçu de votre progression"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Briefcase}
          label="Candidatures"
          value={stats?.candidatures?.active || 0}
          sub={`${stats?.candidatures?.total || 0} au total`}
          to="/candidatures"
          color="bg-primary-100 text-primary-600"
        />
        <StatCard
          icon={GraduationCap}
          label="Bourses"
          value={stats?.bourses?.active || 0}
          sub={`${stats?.bourses?.total || 0} au total`}
          to="/bourses"
          color="bg-accent-100 text-accent-600"
        />
        <StatCard
          icon={Target}
          label="Objectifs"
          value={stats?.objectives?.inProgress || 0}
          sub={`${stats?.objectives?.total || 0} au total`}
          to="/objectives"
          color="bg-warning-50 text-warning-600"
        />
        <StatCard
          icon={FileText}
          label="Documents"
          value={`${stats?.documents?.ready || 0}/${stats?.documents?.total || 0}`}
          sub="prêts"
          to="/documents"
          color="bg-success-50 text-success-600"
        />
      </div>

      {stats?.documents?.total > 0 && (
        <Card className="mb-8 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-surface-700">Progression documents</p>
            <p className="text-sm text-surface-400">{stats.documents.ready}/{stats.documents.total}</p>
          </div>
          <ProgressBar value={stats.documents.ready} max={stats.documents.total} />
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="px-5 py-4 border-b border-surface-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-surface-400" />
              <h3 className="font-semibold text-surface-800 font-heading">Prochaines échéances</h3>
            </div>
            <Link to="/agenda" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              Tout voir <ArrowRight size={14} />
            </Link>
          </div>
          <CardBody>
            {loadingDeadlines ? (
              <p className="text-sm text-surface-400">Chargement...</p>
            ) : !deadlines?.length ? (
              <p className="text-sm text-surface-400">Aucune échéance à venir</p>
            ) : (
              <ul className="space-y-3">
                {deadlines.slice(0, 5).map((d, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-surface-700 truncate mr-4">{d.title}</span>
                    <span className="text-xs text-surface-400 whitespace-nowrap">{formatDeadline(d.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-surface-100 flex items-center gap-2">
            <Activity size={18} className="text-surface-400" />
            <h3 className="font-semibold text-surface-800 font-heading">Activité récente</h3>
          </div>
          <CardBody>
            {loadingActivity ? (
              <p className="text-sm text-surface-400">Chargement...</p>
            ) : !activity?.length ? (
              <p className="text-sm text-surface-400">Aucune activité récente</p>
            ) : (
              <ul className="space-y-3">
                {activity.slice(0, 5).map((a, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-surface-700 truncate mr-4">{a.description}</span>
                    <span className="text-xs text-surface-400 whitespace-nowrap">{formatRelative(a.date)}</span>
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
