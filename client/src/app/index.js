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

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path='/'>
            <Route index element={<LoginPage />} />
            <Route path='studentdocuments' element={<DocumentsPage />} />
            <Route path='studentdefense' element={<DefensePage />} />
            <Route path='studentdashboard' element={<DashboardPage />} />
            <Route path='studentregister' element={<RegisterPage />} />
            <Route path='studentconfirm' element={<RegisterConfirmationPage />} />
            <Route path='*' element={<ErrorPage/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    )
  }
}

export default App;
