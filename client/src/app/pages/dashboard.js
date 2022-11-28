import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import GroupService from '../services/GroupService'
import ViewCalendarSection from '../components/sections/ViewCalendarSection'
import GroupInfoSection from '../components/sections/GroupInfoSection'
import ViewAnnouncementsSection from '../components/sections/ViewAnnouncementsSection'

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
          <ViewAnnouncementsSection />
          <ViewCalendarSection defense />
          <ViewCalendarSection />
        </div>
        <div className="tm-column">
          <GroupInfoSection group={group} title='My Group' />
        </div>
      </div>
    </>
  )
}

export default DashboardPage
