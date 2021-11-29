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

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path='/'>
            <Route index element={<DashboardPage />} />
            <Route path='documents' element={<DocumentsPage />} />
            <Route path='defense' element={<DefensePage />} />
            <Route path='login' element={<LoginPage />} />
            <Route path='register' element={<RegisterPage />} />
            <Route path='confirm' element={<RegisterConfirmationPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    )
  }
}

export default App;
