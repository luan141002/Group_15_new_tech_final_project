import { Helmet } from "react-helmet"
import EditGroupsSection from "../../components/sections/EditGroupsSection"

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
          <EditGroupsSection />
        </div>
      </div>
    </>
  )
}

export default GroupsPage
