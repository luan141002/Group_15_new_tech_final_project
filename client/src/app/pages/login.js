import logo from '../../assets/images/logo.png'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { NavLink } from 'react-router-dom'
import AuthService from '../services/AuthService'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const token = AuthService.getToken()

  const onChange = (setter) => (event) => {
    setter(event.target.value)
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    const result = await fetch(`${process.env.REACT_APP_API}/account/login`, {
      body: JSON.stringify({ username, password }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })

    if (result.ok) {
      const data = await result.json()
      localStorage.setItem('token', data.token)
      navigate('/studentdashboard')
    } else {
      
    }
  }

  return (
    <>
      { token && <Navigate to='/' /> }
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Log in Student' content='width=device-width, initial-scale=1.0' />
        <title>Log in Page Student</title>
      </Helmet>
      <form class="form" id="login" onSubmit={onSubmit}>
        <div class="form_input-group" >
          <input class="form_input" type="text" autofocus placeholder="email / username" onChange={onChange(setUsername)} required />
          <div class="form__input-error-message"></div> 
        </div>
        <div class="form_input-group">
          <input class="form_input" type="password" autofocus placeholder="password" onChange={onChange(setPassword)} required />
          <div class="form__input-error-message"></div>            
        </div>
        
        <button class="form_button" type="submit" id="button1"> Login </button>
        <p class="form_text">
          <NavLink to='/studentregister' style={{ color: '#8F8F8F' }}> No account? Register </NavLink>
        </p>
      </form>
    </>
  )
}

export default LoginPage
