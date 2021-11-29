const NotificationsOverlay = (props) => {
  const { onClose, className, overlayName, ...otherProps } = props

  const close = () => {
    if (onClose) onClose()
  }

  return (
    <div className="notification_box" id="notification" {...props=otherProps}>
      <h2 className="dashboard_text">Notification</h2>

      <button style={{ position: 'relative', bottom: '50px', left: '600px', border: 'none' }} id="hide_notif" onClick={close}> X </button>

      <div className="notif_box"> 
        <a href='/' className="preference_text" style={{ fontSize: '14px', position: 'relative', top: '15px', color: '#404040' }}> Deadline moved </a>
        <a href='/' className="preference_text" style={{ fontSize: '14px', position: 'relative', top: '20px', color: '#818181' }}> <br />NOTICE: Thesis documents submissions moved to... </a>
      </div>

      <div className="notif_box"> 
        <a href='/' className="preference_text" style={{ fontSize: '14px', position: 'relative', top: '15px', color: '#404040' }}> Deadline moved </a>
        <a href='/' className="preference_text" style={{ fontSize: '14px', position: 'relative', top: '20px', color: '#818181' }}> <br />NOTICE: Thesis documents submissions moved to... </a>
      </div>
    </div>
  )
}

export default NotificationsOverlay
