import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, GraduationCap, Target, FileText, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { authApi } from '../api/auth.js'
import { candidaturesApi } from '../api/candidatures.js'
import { objectivesApi } from '../api/objectives.js'
import { documentsApi } from '../api/documents.js'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { useToast } from '../components/ui/Toast.jsx'

const GOALS = [
  { id: 'alternance', icon: Briefcase, label: 'Alternance', desc: 'Je cherche une entreprise pour mon alternance' },
  { id: 'stage', icon: Target, label: 'Stage', desc: 'Je recherche un stage' },
  { id: 'emploi', icon: Briefcase, label: 'Premier emploi', desc: 'Je cherche mon premier emploi après mes études' },
  { id: 'bourses', icon: GraduationCap, label: 'Bourses & aides', desc: 'Je veux suivre mes demandes de bourses' },
]

const SUGGESTED_DOCS = [
  { name: 'CV', category: 'professional' },
  { name: 'Lettre de motivation', category: 'professional' },
  { name: 'Relevés de notes', category: 'academic' },
  { name: 'Pièce d\'identité', category: 'identity' },
  { name: 'RIB', category: 'financial' },
  { name: 'Attestation de scolarité', category: 'academic' },
]

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? 'w-8 bg-primary-500' : i < current ? 'w-8 bg-primary-300' : 'w-8 bg-surface-200'
          }`}
        />
      ))}
    </div>
  )
}

function StepWelcome({ user, onNext }) {
  return (
    <div className="text-center max-w-md mx-auto">
      <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-6">
        <Sparkles size={36} className="text-primary-600" />
      </div>
      <h1 className="text-3xl font-bold font-heading text-surface-900 mb-3">
        Bienvenue, {user?.firstName} !
      </h1>
      <p className="text-surface-500 text-lg mb-2">
        Gestion va vous aider à organiser toutes vos démarches.
      </p>
      <p className="text-surface-400 text-sm mb-10">
        Quelques questions pour personnaliser votre espace. Cela prend moins d'une minute.
      </p>
      <Button onClick={onNext} className="px-8 py-3 text-base">
        C'est parti <ArrowRight size={18} />
      </Button>
    </div>
  )
}

function StepGoal({ selected, onSelect, onNext, onBack }) {
  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold font-heading text-surface-900 text-center mb-2">
        Quel est votre objectif principal ?
      </h2>
      <p className="text-surface-400 text-sm text-center mb-8">
        Vous pourrez toujours utiliser tous les modules, c'est juste pour personnaliser votre dashboard.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {GOALS.map(g => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className={`flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
              selected === g.id
                ? 'border-primary-500 bg-primary-50 shadow-sm'
                : 'border-surface-200 hover:border-surface-300 bg-white'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              selected === g.id ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-500'
            }`}>
              <g.icon size={20} />
            </div>
            <div>
              <p className="font-semibold text-surface-800 text-sm">{g.label}</p>
              <p className="text-xs text-surface-500 mt-0.5">{g.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Retour</Button>
        <Button onClick={onNext} disabled={!selected}>Continuer <ArrowRight size={16} /></Button>
      </div>
    </div>
  )
}

function StepFirstAction({ goalType, firstCompany, setFirstCompany, firstJob, setFirstJob, selectedDocs, setSelectedDocs, onNext, onBack, loading }) {
  const toggleDoc = (name) => {
    setSelectedDocs(prev =>
      prev.includes(name) ? prev.filter(d => d !== name) : [...prev, name]
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-2xl font-bold font-heading text-surface-900 text-center mb-2">
        Configurons votre espace
      </h2>
      <p className="text-surface-400 text-sm text-center mb-8">
        Tout est optionnel, vous pourrez compléter plus tard.
      </p>

      {(goalType === 'alternance' || goalType === 'stage' || goalType === 'emploi') && (
        <div className="bg-white rounded-xl border border-surface-200 p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase size={18} className="text-primary-500" />
            <h3 className="font-semibold text-surface-800 text-sm">Votre première candidature</h3>
            <span className="text-xs text-surface-400 ml-auto">Optionnel</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Nom de l'entreprise"
              value={firstCompany}
              onChange={e => setFirstCompany(e.target.value)}
              autoComplete="organization"
            />
            <Input
              placeholder="Poste visé"
              value={firstJob}
              onChange={e => setFirstJob(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-surface-200 p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-primary-500" />
          <h3 className="font-semibold text-surface-800 text-sm">Documents à préparer</h3>
          <span className="text-xs text-surface-400 ml-auto">Sélectionnez ceux dont vous avez besoin</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {SUGGESTED_DOCS.map(doc => (
            <button
              key={doc.name}
              onClick={() => toggleDoc(doc.name)}
              className={`flex items-center gap-2 p-3 rounded-lg text-sm text-left transition-all cursor-pointer ${
                selectedDocs.includes(doc.name)
                  ? 'bg-primary-50 border border-primary-300 text-primary-700'
                  : 'bg-surface-50 border border-surface-200 text-surface-600 hover:border-surface-300'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                selectedDocs.includes(doc.name) ? 'bg-primary-500 text-white' : 'bg-surface-200'
              }`}>
                {selectedDocs.includes(doc.name) && <Check size={12} />}
              </div>
              {doc.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}><ArrowLeft size={16} /> Retour</Button>
        <Button onClick={onNext} disabled={loading}>
          {loading ? 'Création...' : 'Terminer'}
          {!loading && <Check size={16} />}
        </Button>
      </div>
    </div>
  )
}

export function OnboardingPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [goalType, setGoalType] = useState('')
  const [firstCompany, setFirstCompany] = useState('')
  const [firstJob, setFirstJob] = useState('')
  const [selectedDocs, setSelectedDocs] = useState(['CV', 'Lettre de motivation'])
  const [loading, setLoading] = useState(false)

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Create first candidature if filled
      if (firstCompany.trim()) {
        await candidaturesApi.create({
          companyName: firstCompany.trim(),
          jobTitle: firstJob.trim() || `${goalType === 'stage' ? 'Stage' : goalType === 'emploi' ? 'Emploi' : 'Alternance'}`,
          status: 'A_POSTULER',
        })
      }

      // Create selected documents
      for (const docName of selectedDocs) {
        const doc = SUGGESTED_DOCS.find(d => d.name === docName)
        await documentsApi.create({
          name: docName,
          category: doc?.category || 'professional',
          status: 'A_FAIRE',
        })
      }

      // Complete onboarding
      const { data: updatedUser } = await authApi.completeOnboarding({ goalType })
      updateUser(updatedUser)
      toast('Votre espace est prêt !', 'success')
      navigate('/')
    } catch {
      toast('Erreur lors de la configuration', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        {step > 0 && <StepIndicator current={step - 1} total={2} />}

        {step === 0 && (
          <StepWelcome user={user} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <StepGoal
            selected={goalType}
            onSelect={setGoalType}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StepFirstAction
            goalType={goalType}
            firstCompany={firstCompany}
            setFirstCompany={setFirstCompany}
            firstJob={firstJob}
            setFirstJob={setFirstJob}
            selectedDocs={selectedDocs}
            setSelectedDocs={setSelectedDocs}
            onNext={handleComplete}
            onBack={() => setStep(1)}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
