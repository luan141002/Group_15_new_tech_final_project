import logo from '../../assets/images/logo.png'
import { useContext, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { NavLink } from 'react-router-dom'
import AuthService from '../services/AuthService'
import AccountContext from '../providers/account'

function LoginPage() {
  const { account, setAccount } = useContext(AccountContext)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [nextUrl, setNextUrl] = useState('')
  const navigate = useNavigate()

  const onChange = (setter) => (event) => {
    setter(event.target.value)
  }

  useEffect(() => {
    if (account) {
      const nextUrl = AuthService.findRedirectUrl(account.kind)
      setNextUrl(nextUrl)
    }
  }, [account])

  const onSubmit = async (event) => {
    event.preventDefault()
    const result = await AuthService.login(username, password)
    setAccount({
      token: result.id,
      kind: result.kind,
      roles: result.roles,
      info: result.account
    })
    navigate(result.nextUrl)
  }

  return (
    <>
      { nextUrl && <Navigate to={nextUrl} /> }
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Log in' content='width=device-width, initial-scale=1.0' />
        <title>Log in</title>
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
