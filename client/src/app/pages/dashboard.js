import { Component, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import Overlay from '../components/overlay'

import person2 from '../../assets/images/person2.jpg'
import AccountPreferencesOverlay from '../components/overlays/account-preferences'
import NotificationsOverlay from '../components/overlays/notifications'
import GroupService from '../services/GroupService'
import ViewCalendarSection from '../components/sections/ViewCalendarSection'
import GroupInfoSection from '../components/sections/GroupInfoSection'

function DashboardPage() {
  const [group, setGroup] = useState(null)

  useEffect(() => {
    async function load() {
      const groups = await GroupService.getMyGroups()
      if (groups && groups.length > 0) {
        setGroup(groups[0])
      }
    }

    load()
  }, [])

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Student Dashboard' content='width=device-width, initial-scale=1.0' />
        <title>Student Dashboard</title>
      </Helmet>
      <div className="tm-row">
        <div className="tm-column" style={{ flexGrow: 3 }}>
          <ViewCalendarSection />
          <div className="documents">
            <h2 className="dashboard_text"> Documents </h2>
            <div className="column" style={{ width: '55%', padding: '0' }}>
              <a href='/' className="dashboard_elementNames"> Document Title </a>
              <ul>
                <li className="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                <li className="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                <li className="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
                <li className="dashboard_elements"><input type="checkbox" /> Signed revisions approval form </li>
              </ul>
            </div>
            <div className="column" style={{ width: '15%', padding: '0' }}>
              <a href='/' className="dashboard_elementNames"> Status </a>
              <ul style={{ listStyleType: 'none' }}>
                <li className="dashboard_elements"> Done </li>
                <li className="dashboard_elements"> Done </li>
                <li className="dashboard_elements"> Done </li>
                <li className="dashboard_elements"> Done </li>
              </ul>
            </div>
            <div className="column" style={{ width: '30%', padding: '0' }}> 
              <a href='/' className="dashboard_elementNames"> Submitted </a>
              <ul>
                <li className="dashboard_elements"> 13 Dec 2020 </li>
                <li className="dashboard_elements"> 13 Dec 2020 </li>
                <li className="dashboard_elements"> 13 Dec 2020 </li>
                <li className="dashboard_elements"> 13 Dec 2020 </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="tm-column">
          <GroupInfoSection group={group} title='My Group' />
          <div className="deadlines">
            <h2 className="dashboard_text">Deadlines</h2>
          </div>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
