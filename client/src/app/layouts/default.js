import { useState } from "react"
import { Outlet, useNavigate } from "react-router"
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap"
import Sidebar from "../components/sidebar/sidebar"
import AuthService from "../services/AuthService"
import './default.css'

const DefaultLayout = (props) => {
  const [accountDropdown, setAccountDropdown] = useState(false)
  const navigate = useNavigate()

  const onAccountPrefs = () => {

  }

  const onLogout = () => {
    AuthService.logout()
    navigate('/login')
  }

  return (
    <>
      <div className="page">
        <Sidebar entries={[
          { title: 'Overview', to: '', exact: true },
          { title: 'Group', to: '/group' },
          { title: 'Submissions', to: '/assignment' },
        ]} />
        <div className='content-pane'>
          <div className='content-header'>
            <h1 style={{ fontFamily: 'Lato, "Segoe UI"', margin: '1rem', padding: '.5rem' }}>{/*Thesis Management System*/}</h1>
            <div style={{ alignItems: 'end' }}>
              <Dropdown isOpen={accountDropdown} toggle={() => setAccountDropdown(!accountDropdown)}>
                <DropdownToggle data-toggle='dropdown' tag='div' style={{ cursor: 'pointer' }}>
                  <div>
                    <button className="account_text" style={{ right: '35px', backgroundColor: 'transparent', border: 'none' }} id="account_button">Name</button>
                    <span className="account_text" style={{ top: '35px', left: '80px', color: '#818181' }}>Student account</span>
                  </div>
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={onAccountPrefs}>Account</DropdownItem>
                  <DropdownItem onClick={onLogout}>Log out</DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
          <div className='content'>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}

export default DefaultLayout
