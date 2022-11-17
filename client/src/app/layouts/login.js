import { Outlet } from 'react-router'
import { NavLink } from 'react-router-dom'
import logo from '../../assets/images/logo.png'
import './login.css'

const LoginLayout = (props) => {
  const { children } = props
  return (
    <>
      <div id='loginContainer'>
        <div>
          <a href='/'>
            <img src={logo} alt='logo' style={{ width: '10em', position: 'static'}} /> 
          </a>
        </div>
        <div>
          <h1 class="form_title">Thesis Management Portal</h1>
        </div>
        <div class="container">
          { children ? children : <Outlet /> }
        </div>
        <div>
          <button style={{width:'auto', padding: '.75rem', color: '#ffffff', border:'none',
                          outline: 'none', background: 'var(--color-primary)'}}>
            <NavLink to="/admin" style={{color:'white'}} activeStyle={{ color: 'red' }}>Temporary Link to access ADMIN dashboard</NavLink>
          </button>
        </div>
      </div>
    </>
  )
}

export default LoginLayout
