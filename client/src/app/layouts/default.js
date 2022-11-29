import { Outlet } from "react-router"
import Sidebar from "../components/sidebar/sidebar"
import './default.css'
import HeaderSection from "../components/sections/HeaderSection"

const DefaultLayout = (props) => {
  return (
    <>
      <div className="page">
        <Sidebar entries={[
          { title: 'Overview', to: '', exact: true },
          { title: 'Defense Week', to: '/defense' },
          { title: 'Group', to: '/group' },
          { title: 'Schedule', to: '/schedule' },
          { title: 'Submissions', to: '/assignment' },
        ]} />
        <div className='content-pane'>
          <div className='content-header'>
            <HeaderSection caption='Student account' />
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
