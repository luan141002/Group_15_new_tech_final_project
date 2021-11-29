import person2 from '../../../assets/images/person2.jpg'

const AccountPreferencesOverlay = (props) => {
  const { onClose, className, overlayName, ...otherProps } = props

  const close = () => {
    if (onClose) onClose()
  }

  return (
    <div className="account_preference" id="account_preference" {...props=otherProps}>
      <h2 className="dashboard_text">Account Preference</h2>
      <img className="profile_pic" src={person2} alt='person2.jpg' />
      <h2 className="dashboard_text" style={{ fontWeight: 500, top: '50px', position: 'relative', left: '24px' }}>
        MAPA, Jamie Shekinah B<br />
        jamie_mapa@dlsu.edu.ph<br />
        11827335
      </h2>

      <h3 className="preference_text">AnimoPlan: A Thesis Management System for the CCS Software Technology Department</h3>
      <a href='/' className="preference_text" style={{ marginTop: '200px' }}> Adviser: Rafael Cabredo </a>
      <a href='/' className="preference_text" style={{ marginTop: '225px' }}>
        Members: John Chua <br />
        John Richard Go <br />
        Mark Tiburcio
      </a>
      <button className="regular_buttons" style={{ top: '500px', left: '50px' }} id="accountsave_button" onClick={close}>Save</button>
      <button className="regular_buttons" style={{ top: '500px', left: '75px', backgroundColor: '#818181' }}>Log out</button>
    </div>
  )
}

export default AccountPreferencesOverlay
