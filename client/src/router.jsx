import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout.jsx'
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { RegisterPage } from './pages/RegisterPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'
import { CandidaturesPage } from './pages/CandidaturesPage.jsx'
import { CandidatureDetailPage } from './pages/CandidatureDetailPage.jsx'
import { BoursesPage } from './pages/BoursesPage.jsx'
import { BourseDetailPage } from './pages/BourseDetailPage.jsx'
import { ObjectivesPage } from './pages/ObjectivesPage.jsx'
import { DocumentsPage } from './pages/DocumentsPage.jsx'
import { AgendaPage } from './pages/AgendaPage.jsx'
import { JournalPage } from './pages/JournalPage.jsx'
import { SettingsPage } from './pages/SettingsPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'candidatures', element: <CandidaturesPage /> },
      { path: 'candidatures/:id', element: <CandidatureDetailPage /> },
      { path: 'bourses', element: <BoursesPage /> },
      { path: 'bourses/:id', element: <BourseDetailPage /> },
      { path: 'objectives', element: <ObjectivesPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'agenda', element: <AgendaPage /> },
      { path: 'journal', element: <JournalPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
