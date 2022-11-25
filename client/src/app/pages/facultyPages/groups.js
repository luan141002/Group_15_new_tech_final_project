import { Helmet } from "react-helmet"
import EditGroupsSection from "../../components/sections/EditGroupsSection"
import GroupsSection from '../../components/sections/EditGroupsSection'
import MyGroupsSection from '../../components/sections/MyGroupsSection'

function GroupsPage() {
  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Groups' content='width=device-width, initial-scale=1.0' />
        <title>Groups</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column'>
          <GroupsSection getLink={group => `/faculty/group/${group.id}`} />
          <MyGroupsSection getLink={group => `/faculty/group/${group.id}`} />
          <EditGroupsSection />
        </div>
      </div>
    </>
  )
}

export default GroupsPage
