import logo from '../../assets/images/logo.png'
import { Component } from 'react'
import { NavLink } from 'react-router-dom'

class RegisterConfirmationPage extends Component {
  render() {
    return (
      <>
        <img src={logo} alt='logo' style={{ width: '240px', top: '200px', position: 'absolute' }} /> 
        <h1 class="form_title">Thesis Management Portal</h1>
        <div class="container">
          <p class="form_text">
            <a href='/' style={{ color: '#8F8F8F' }}> You will recieve an email once your registration is <br /> approved by your thesis coordiniator</a>
          </p>
          <p class="form_text">
            <NavLink to='/login' style={{ color: '#8F8F8F', top: '100px' }}> Back to login </NavLink>
          </p>
        </div>
      </>
    )
  }
}

export default RegisterConfirmationPage
