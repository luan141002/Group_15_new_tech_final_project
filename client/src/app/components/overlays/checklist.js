const ChecklistOverlay = (props) => {
  const { onClose, className, overlayName, ...otherProps } = props

  const close = () => {
    if (onClose) onClose()
  }

  return (
    <div class="add_checklist" id="add_checklist" {...props=otherProps}>
      <h2 class="dashboard_text"> Add Task </h2>
      <input class="form_input" style={{ top: '10px', width: '500px' }} id="task" type="text" autofocus placeholder="Submission Title" /> 
      <button class="regular_buttons" style={{ top: '70px', left: '350px' }} onClick={close}> Done </button>
    </div>
  )
}

export default ChecklistOverlay
