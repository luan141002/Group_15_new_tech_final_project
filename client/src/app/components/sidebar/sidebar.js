import React from 'react'
import { NavLink } from 'react-router-dom'
import './sidebar.css'

// { title: string, to: string }

const Sidebar = (props) => {
  return (
    <div className='sidebar'>
      <div className='sidebar-content'>
        {
          props.entries.map(e => {
            const { to, title, exact } = e
            return <NavLink className='sidebar-button' to={to} exact={exact ? true : false}>{title}</NavLink>
          })
        }
        <button className="sidebar-button">Upload Document</button>
      </div>
    </div>
  )
}

export default Sidebar