import logo from '../../assets/images/logo.png'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { clone, merge } from 'lodash'

function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '', confirm: '', accessCode: '' })
  const [message, setMessage] = useState({ email: '', username: '', password: '', confirm: '', accessCode: '' })

  const validators = {
    password: {
      conditions: [ { condition: v => !!v, message: 'Password is required.' } ]
    },
    confirm: {
      conditions: [
        { condition: v => !!v, message: 'Confirm password is required.' },
        { condition: (v, s) => v === s.password, message: 'Passwords must match.' }
      ]
    },
    accessCode: {
      conditions: [ { condition: v => !!v, message: 'Access code is required.' } ]
    },
    username: {
      conditions: [ { condition: v => !!v, message: 'Username is required.' } ]
    },
    email: {
      conditions: [ { condition: v => !!v, message: 'Email is required.' } ]
    },
  }

  const validateForm = () => {
    let ok = true

    const messages = {}
    for (const [key, value] of Object.entries()) {
      const validator = validators[key]
      messages[key] = ''
      if (validator) {
        for (const cond of validator.conditions) {
          if (!cond.condition(value, form)) {
            ok = false
            messages[key] = cond.message
          }
        }
      }
    }

    setMessage(prev => merge(prev, messages))
    return ok
  }

  const onChange = field => event => {
    const target = event.currentTarget
    if (target) {
      setForm(prev => merge(clone(prev), { [field]: target.value }))
    }
  }

  const onSubmit = async event => {
    event.preventDefault()
    
    if (!validateForm()) return

    await fetch('http://localhost:8080/accounts/register/student', {
      body: JSON.stringify({
        username: form.username,
        password: form.password,
        accessCode: form.accessCode,
        email: form.email
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  return (
    <>
      <img src={logo} alt='logo' style={{ width: '240px', top: '200px', position: 'absolute' }} /> 
      <h1 class="form_title">Thesis Management Portal</h1>
      <div class="container">
        <form class="form" id="login" onSubmit={onSubmit}>
          <div class="form_input-group">
            <input class="form_input" type="text" style={{ top:'0px' }} value={form.email} onChange={onChange('email')} autofocus placeholder="email" required />
            <div class="form__input-error-message">{message.email}</div> 
          </div>
          <div class="form_input-group">
            <input class="form_input" type="text" style={{ top:'0px' }} value={form.username} onChange={onChange('username')} autofocus placeholder="username" required />
            <div class="form__input-error-message">{message.username}</div>            
          </div> 
          <div class="form_input-group">
            <input class="form_input" type="text" style={{ top:'0px' }} value={form.accessCode} onChange={onChange('accessCode')} autofocus placeholder="access code" required />
            <div class="form__input-error-message">{message.accessCode}</div>            
          </div>
          <div class="form_input-group">
            <input class="form_input" type="password" style={{ top:'0px' }} value={form.password} onChange={onChange('password')} autofocus placeholder="password" required />
            <div class="form__input-error-message">{message.password}</div>            
          </div>
          <div class="form_input-group">
            <input class="form_input" type="password" style={{ top:'0px' }} value={form.confirm} onChange={onChange('confirm')} autofocus placeholder="confirm password" required />
            <div class="form__input-error-message">{message.confirm}</div>            
          </div>
          
          <button class="form_button" type="button" style={{ top:'0px' }} id="button1"> Register </button>
          <p class="form_text" style={{ top:'0px' }}>
            <NavLink to="/login" class="text_link" style={{ top:'0px' }}> Have an account already? Login </NavLink>
          </p>
        </form>
      </div>
    </>
  )
}

export default RegisterPage
