import { Outlet } from "react-router"
import Sidebar from "../components/sidebar/sidebar"
import './default.css'
import HeaderSection from "../components/sections/HeaderSection"

const AdminLayout = () => {
  return (
    <>
      <div className="page">
        <Sidebar entries={[
          { title: 'Overview', to: '/admin', exact: true },
          { title: 'Announcements', to: '/admin/announcements' },
          { title: 'Defense week', to: '/admin/defense' },
          { title: 'Groups', to: '/admin/groups' },
          { title: 'Members', to: '/admin/members' },
          { title: 'Schedule', to: '/admin/schedule' },
        ]} />
        <div className='content-pane'>
          <div className='content-header'>
            <HeaderSection caption='Admin account' />
          </div>
          <div className='content'>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminLayout
