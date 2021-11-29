import logo from '../../assets/images/logo.png'
import { Component } from 'react'
import { NavLink } from 'react-router-dom'

class RegisterPage extends Component {
  handleSubmit = () => {
    
  }

  render() {
    return (
      <>
        <img src={logo} alt='logo' style={{ width: '240px', top: '200px', position: 'absolute' }} /> 
        <h1 class="form_title">Thesis Management Portal</h1>
        <div class="container">
          <form class="form" id="login" method='POST' action='/confirm'>
            <div class="form_input-group">
              <input class="form_input" type="text" style={{ top:'0px' }} autofocus placeholder="email" required />
              <div class="form__input-error-message"></div> 
            </div>
            <div class="form_input-group">
              <input class="form_input" type="text" style={{ top:'0px' }} autofocus placeholder="username" required />
              <div class="form__input-error-message"></div>            
            </div> 
            <div class="form_input-group">
              <input class="form_input" type="text" style={{ top:'0px' }} autofocus placeholder="access code" required />
              <div class="form__input-error-message"></div>            
            </div>
            <div class="form_input-group">
              <input class="form_input" type="text" style={{ top:'0px' }} autofocus placeholder="password" required />
              <div class="form__input-error-message"></div>            
            </div>
            <div class="form_input-group">
              <input class="form_input" type="text" style={{ top:'0px' }} autofocus placeholder="confirmpassword" required />
              <div class="form__input-error-message"></div>            
            </div>
            
            <button class="form_button" type="button" style={{ top:'0px' }} id="button1"> Login </button>
            <p class="form_text" style={{ top:'0px' }}>
              <NavLink to="/login" class="text_link" style={{ top:'0px' }}> Have an account already? Login </NavLink>
            </p>
          </form>
        </div>
      </>
    )
  }
}

export default RegisterPage
