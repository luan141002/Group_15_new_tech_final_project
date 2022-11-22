import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles.css'
import { Component, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorPage from './pages/err'
import PrivateRoute from './PrivateRoute'
import LoginLayout from './layouts/login'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import DefaultLayout from './layouts/default'
import AdminLayout from './layouts/admin'
import FacultyLayout from './layouts/faculty'
import DashboardPage from './pages/dashboard'
import RegisterConfirmationPage from './pages/confirm'
import DocumentsPage from './pages/documents'
import DefensePage from './pages/defense'
import AdminDashboardPage from './pages/adminPages/dashboard'
import AdminAnnouncementsPage from './pages/adminPages/announcements'
import AdminGroupsPage from './pages/adminPages/groups'
import AdminMembersPage from './pages/adminPages/members'
import AdminSchedulePage from './pages/adminPages/schedule'
import FacultyDashboardPage from './pages/facultyPages/dashboard'
import FacultyDocumentPage from './pages/facultyPages/DocumentPage'
import FacultyGroupPage from './pages/facultyPages/group'
import FacultyGroupsPage from './pages/facultyPages/groups'
import FacultyMembersPage from './pages/facultyPages/members'
import FacultySubmissionsPage from './pages/facultyPages/submissions'
import FacultySubmissionPage from './pages/facultyPages/SubmissionPage'
import SubmissionBoxesPage from './pages/SubmissionBoxesPage'
import SubmissionBoxPage from './pages/SubmissionBoxPage'
import SubmissionPage from './pages/SubmissionPage'
import AccountContext from './providers/account'
import AuthService from './services/AuthService';

function App() {
  const [account, setAccount] = useState({ token: null, info: null })

  useEffect(() => {
    async function load() {
      if (!account.token) {
        const token = await AuthService.getTokenInfo()
        if (token) {
          setAccount({
            token: token.id,
            kind: token.kind,
            roles: token.roles,
            info: token.account
          })
        }
      }
    }

    load()
  }, [])
  
  return (
    <AccountContext.Provider value={{ account, setAccount }}>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginLayout><LoginPage /></LoginLayout>} />
          <Route path='/' element={<PrivateRoute redirect='/login' />}>
            <Route path='/admin' element={<PrivateRoute condition={(token) => token.kind === 'administrator'} redirect='/login'><AdminLayout /></PrivateRoute>}>
              <Route path='announcements' element={<AdminAnnouncementsPage />} />
              <Route path='schedule' element={<AdminSchedulePage />} />
              <Route path='members' element={<AdminMembersPage />} />
              <Route path='groups' element={<AdminGroupsPage />} />
              <Route path='' element={<AdminDashboardPage />} />
            </Route>
            <Route path='/faculty' element={<PrivateRoute condition={(token) => token.kind === 'faculty'} redirect='/login'><FacultyLayout /></PrivateRoute>}>
              <Route path='students' element={<FacultyMembersPage />} />
              <Route path='groups' element={<FacultyGroupsPage />} />
              <Route path='group/:id' element={<FacultyGroupPage />} />
              <Route path='submissions' element={<FacultySubmissionsPage />} />
              <Route path='submissions/:id/document/:did' element={<FacultyDocumentPage />} />
              <Route path='submissions/:id' element={<FacultySubmissionPage />} />
              <Route path='' element={<FacultyDashboardPage />} />
            </Route>
            <Route path='' element={<DefaultLayout />}>
              <Route path='submissions/:id' element={<SubmissionPage />} />
              <Route path='assignment/:id' element={<SubmissionBoxPage />} />
              <Route path='assignment' element={<SubmissionBoxesPage />} />
              <Route path='documents' element={<DocumentsPage />} />
              <Route path='defense' element={<DefensePage />} />
              <Route path='' element={<DashboardPage />} />
            </Route>
            <Route path='*' element={<ErrorPage/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AccountContext.Provider>
  )
}

export default App
