import logo from '../../assets/images/logo.png'
import { Component } from 'react'
import { Helmet } from 'react-helmet'
import { NavLink } from 'react-router-dom'

class LoginPage extends Component {
  render() {
    return (
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <meta name='Log in Student' content='width=device-width, initial-scale=1.0' />
          <title>Log in Page Student</title>
        </Helmet>

        <body id='loginContainer'>

          <div>
            <a href='/'>
              <img src={logo} alt='logo' style={{ width: '10em', position: 'static'}} /> 
            </a>
          </div>

          <div>
            <h1 class="form_title">Thesis Management Portal</h1>

          </div>
        
        <div class="container">
          <form class="form" id="login">
            <div class="form_input-group" >
              <input class="form_input" type="text" autofocus placeholder="email / username" required />
              <div class="form__input-error-message"></div> 
            </div>
            <div class="form_input-group">
              <input class="form_input" type="text" autofocus placeholder="password  " required />
              <div class="form__input-error-message"></div>            
            </div>
            
            <button class="form_button" type="button" id="button1"> Login </button>
            <p class="form_text">
              <NavLink to='/studentregister' style={{ color: '#8F8F8F' }}> No account? Register </NavLink>
            </p>
          </form>
        </div>

        <div>
          <button style={{width:'auto', padding: '.75rem', color: '#ffffff', border:'none',
                          outline: 'none', background: 'var(--color-primary)'}}>
          <NavLink to="/admindashboard" style={{color:'white'}}
            activeStyle={{ color: 'red' }}>
            Temporary Link to access ADMIN dashboard</NavLink>

          </button>
          
        </div>

        </body>
        
      </>
    )
  }
}

export default LoginPage
