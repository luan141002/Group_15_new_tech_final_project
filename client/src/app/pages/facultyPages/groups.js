import { Helmet } from "react-helmet"
import GroupsSection from '../../components/sections/groups'
import MyGroupsSection from '../../components/sections/mygroups'

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
          <GroupsSection getLink={group => `/faculty/group/${group._id}`} />
          <MyGroupsSection />
        </div>
      </div>
    </>
  )
}

export default GroupsPage
