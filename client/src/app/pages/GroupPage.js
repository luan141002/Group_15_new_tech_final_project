import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { Table } from 'reactstrap'
import GroupService from "../services/GroupService"
import SubmissionService from "../services/SubmissionService"
import SubmissionBoxesSection from "../components/sections/SubmissionBoxesSection"
import { Link } from "react-router-dom"
import GroupInfoSection from "../components/sections/GroupInfoSection"
import dayjs from 'dayjs'

function GroupPage() {
  const [group, setGroup] = useState(null)
  const [submissions, setSubmissions] = useState([])

  const load = async() => {
    try {
      const groupInfo = await GroupService.getMyGroups()
      setGroup(groupInfo)
      const submissionList = await SubmissionService.getMyGroupSubmissions()
      setSubmissions(submissionList)
    } catch (error) {

    }
  }
  
  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Group' content='width=device-width, initial-scale=1.0' />
        <title>Group</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column' style={{ flexGrow: 3 }}>
          <div className='tm-group'>
            <h2 className="tm-group-name">Submissions</h2>
            <Table>
              <thead>
                <tr>
                  <th>Submission title</th>
                  <th>Date submitted</th>
                </tr>
              </thead>
              <tbody>
                {
                  submissions.map(e => (
                    <tr>
                      <td><Link to={`/faculty/submissions/${e._id}`}>{e.assignment.name}</Link></td>
                      <td>{dayjs(e.submitDate).format('lll')}</td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
          </div>
          <SubmissionBoxesSection readonly getLink={sub => `/faculty/assignment/${sub._id}`} />
        </div>
        <div className='tm-column'>
          <GroupInfoSection group={group} />
        </div>
      </div>
    </>
  )
}

export default GroupPage
