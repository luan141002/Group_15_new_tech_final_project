import React from 'react'
import '../../assets/styles/overlay.scss'

const Overlay = (props) => {
  const { show, children, ...otherProps } = props

  const childrenWithStyle = React.Children.map(children, child => {
    const { overlayName } = child.props
    const nameMatch = overlayName === show
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { style: { display: (nameMatch ? 'inline' : 'none') } })
    }
    return child
  })

  return (
    <>
      <div className="overlay" id="overlay" style={{ display: (show ? 'inline' : 'none') }} {...props=otherProps}>
        {childrenWithStyle}
      </div>
    </>
  )
}

export default Overlay
