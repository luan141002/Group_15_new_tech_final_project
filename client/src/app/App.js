import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles.css'
import { Component } from 'react'
import {  } from 'react-router'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorPage from './pages/err'
import PrivateRoute from './PrivateRoute'
import LoginLayout from './layouts/login'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import DefaultLayout from './layouts/default'
import AdminLayout from './layouts/admin'
import DashboardPage from './pages/dashboard'
import RegisterConfirmationPage from './pages/confirm'
import DocumentsPage from './pages/documents'
import DefensePage from './pages/defense'
import AdminDashboardPage from './pages/adminPages/dashboard'
import AdminAnnouncementsPage from './pages/adminPages/announcements';
import AdminGroupsPage from './pages/adminPages/groups';
import AdminMembersPage from './pages/adminPages/members'
import AdminSchedulePage from './pages/adminPages/schedule';

class App extends Component {
  render() {
    return (
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
            <Route path='studentdocuments' element={<DocumentsPage />} />
            <Route path='studentdefense' element={<DefensePage />} />
            <Route path='studentdashboard' element={<DashboardPage />} />
            <Route path='studentregister' element={<RegisterPage />} />
            <Route path='studentconfirm' element={<RegisterConfirmationPage />} />
            <Route path='' element={<DashboardPage />} />
            <Route path='*' element={<ErrorPage/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    )
  }
}

export default App;
