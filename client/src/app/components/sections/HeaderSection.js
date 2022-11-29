import AccountPreferences from "../overlays/AccountPreferences"
import defaultPhoto from '../../../assets/images/person_110935.png'
import { useNavigate } from "react-router"
import { useState } from "react"
import AccountContext, { EMPTY_ACCOUNT } from "../../providers/account"
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "reactstrap"
import AuthService from "../../services/AuthService"

function HeaderSection(props) {
  const { caption } = props
  const [accountDropdown, setAccountDropdown] = useState(false)
  const navigate = useNavigate()

  const [accountPrefsOpen, setAccountPrefsOpen] = useState(false)

  const onAccountPrefs = () => {
    setAccountPrefsOpen(true)
  }

  const getPhoto = (account) => {
    const { info } = account
    const { photo, photoType } = info
    if (photo && photoType) {
      return `data:${photoType};base64,${photo}`
    }
    return defaultPhoto
  }

  return <>
    <AccountPreferences isOpen={accountPrefsOpen} onClose={() => setAccountPrefsOpen(false)} />
    <h1 style={{ fontFamily: 'Lato, "Segoe UI"', margin: '1rem', padding: '.5rem' }}>Thesis Management System</h1>
    <div className='me-2 ms-auto' style={{ alignItems: 'end' }}>
      <AccountContext.Consumer>
        {
          ({ account, setAccount }) => (
            <Dropdown isOpen={accountDropdown} toggle={() => setAccountDropdown(!accountDropdown)}>
              <DropdownToggle data-toggle='dropdown' tag='div' style={{ display: 'flex', margin: '1rem', cursor: 'pointer' }}>
                <div style={{ flex: '1 0 auto' }}>
                  <img width={48} height={48} src={getPhoto(account)} className='rounded' alt='Profile' />
                </div>
                <div style={{ flex: '1 0 auto' }}>
                  <button style={{ right: '35px', backgroundColor: 'transparent', border: 'none' }} id="account_button">
                    {`${account.info.firstName} ${account.info.lastName}`}
                  </button>
                  <div style={{ top: '35px', left: '80px', color: '#818181' }}>{caption || 'Account'}</div>
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
  </>
}

export default HeaderSection
