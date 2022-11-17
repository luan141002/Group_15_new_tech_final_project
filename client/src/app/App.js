import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles.css'
import { Component } from 'react'
import {  } from 'react-router'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/login'
import RegisterPage from './pages/register'
import DashboardPage from './pages/dashboard'
import RegisterConfirmationPage from './pages/confirm'
import DocumentsPage from './pages/documents'
import DefensePage from './pages/defense'
import ErrorPage from './pages/err'
import AdminDashboardPage from './pages/adminPages/dashboard'
import PrivateRoute from './PrivateRoute'
import DefaultLayout from './layouts/default'
import MembersPage from './pages/adminPages/members'
import LoginLayout from './layouts/login'
import AdminLayout from './layouts/admin'
import GroupsPage from './pages/adminPages/groups';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginLayout><LoginPage /></LoginLayout>} />
          <Route path='/admin' element={<AdminLayout />}>
            <Route path='members' element={<MembersPage />} />
            <Route path='groups' element={<GroupsPage />} />
            <Route path='' element={<AdminDashboardPage />} />
          </Route>
          <Route path='/' element={<PrivateRoute redirect='/login' />}>
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
