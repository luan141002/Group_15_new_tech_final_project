import { Outlet } from "react-router"
import Sidebar from "../components/sidebar/sidebar"
import './default.css'
import HeaderSection from "../components/sections/HeaderSection"

const FacultyLayout = () => {
  return (
    <>
      <div className="page">
        <Sidebar entries={[
          { title: 'Overview', to: '/faculty', exact: true },
          { title: 'Defense week', to: '/faculty/defense' },
          { title: 'Groups', to: '/faculty/groups' },
          { title: 'Schedule', to: '/faculty/schedule' },
          { title: 'Students', to: '/faculty/students' },
          { title: 'Submissions', to: '/faculty/submissions' },
        ]} />
        <div className='content-pane'>
          <div className='content-header'>
            <HeaderSection caption='Faculty account' />
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
