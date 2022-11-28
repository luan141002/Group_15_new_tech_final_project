import { useState } from "react"
import { Outlet, useNavigate } from "react-router"
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap"
import AccountPreferences from "../components/overlays/AccountPreferences"
import Sidebar from "../components/sidebar/sidebar"
import AccountContext, { EMPTY_ACCOUNT, useAccount } from "../providers/account"
import AuthService from "../services/AuthService"
import './default.css'
import defaultPhoto from '../../assets/images/person_110935.png'

const DefaultLayout = (props) => {
  const { account } = useAccount()

  const [accountDropdown, setAccountDropdown] = useState(false)
  const navigate = useNavigate()

  const [accountPrefsOpen, setAccountPrefsOpen] = useState(false)

  const onAccountPrefs = () => {
    setAccountPrefsOpen(true)
  }

  const getPhoto = () => {
    const { info } = account
    const { photo, photoType } = info
    if (photo && photoType) {
      return `data:${photoType};base64,${photo}`
    }
    return defaultPhoto
  }

  return (
    <>
      <AccountPreferences isOpen={accountPrefsOpen} onClose={() => setAccountPrefsOpen(false)} />
      <div className="page">
        <Sidebar entries={[
          { title: 'Overview', to: '', exact: true },
          { title: 'Group', to: '/group' },
          { title: 'Schedule', to: '/schedule' },
          { title: 'Submissions', to: '/assignment' },
        ]} />
        <div className='content-pane'>
          <div className='content-header'>
            <h1 style={{ fontFamily: 'Lato, "Segoe UI"', margin: '1rem', padding: '.5rem' }}>{/*Thesis Management System*/}</h1>
            <div style={{ alignItems: 'end' }}>
              <AccountContext.Consumer>
                {
                  ({ account, setAccount }) => (
                    <Dropdown isOpen={accountDropdown} toggle={() => setAccountDropdown(!accountDropdown)}>
                      <DropdownToggle data-toggle='dropdown' tag='div' style={{ cursor: 'pointer' }}>
                        <div>
                          <img width={48} height={48} src={getPhoto()} className='rounded' alt='Profile' />
                          <button className="account_text" style={{ right: '35px', backgroundColor: 'transparent', border: 'none' }} id="account_button">
                            {`${account.info.firstName} ${account.info.lastName}`}
                          </button>
                          <span className="account_text" style={{ top: '35px', left: '80px', color: '#818181' }}>Student account</span>
                        </div>
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem onClick={onAccountPrefs}>Account</DropdownItem>
                        <DropdownItem onClick={() => {
                          AuthService.logout()
                          setAccount(EMPTY_ACCOUNT)
                          navigate('/login')
                        }}>Log out</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  )
                }
              </AccountContext.Consumer>
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
