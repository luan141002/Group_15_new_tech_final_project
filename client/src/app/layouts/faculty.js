import { Outlet } from "react-router"
import Sidebar from "../components/sidebar/sidebar"
import './default.css'

const FacultyLayout = (props) => {
  return (
    <>
      <div className="page">
        <Sidebar entries={[
          { title: 'Overview', to: '/faculty', exact: true },
          { title: 'Documents', to: '/faculty/documents' },
          { title: 'Defense week', to: '/faculty/defense' },
          { title: 'Students', to: '/faculty/students' },
          { title: 'Groups', to: '/faculty/groups' },
        ]} />
        <div className='content-pane'>
          <div className='content-header'>
            <h1 style={{ fontFamily: 'Lato, "Segoe UI"', margin: '1rem', padding: '.5rem' }}>{/*Thesis Management System*/}</h1>
            <div style={{ alignItems: 'end' }}>
              <button className="account_text" style={{ right: '35px', backgroundColor: 'transparent', border: 'none' }} id="account_button">Name</button>
              <a href='/' className="account_text" style={{ top: '35px', left: '80px', color: '#818181' }}>Faculty account</a>
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

export default FacultyLayout
