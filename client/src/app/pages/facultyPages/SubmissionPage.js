import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { useParams } from "react-router"
import SubmissionService from "../../services/SubmissionService"
import GroupService from '../../services/GroupService'
import CommentSection from '../../components/sections/CommentSection'
import SubmissionSection from "../../components/sections/SubmissionSection"
import GroupInfoSection from "../../components/sections/GroupInfoSection"

function SubmissionPage() {
  const { id } = useParams()

  const [submission, setSubmission] = useState(null)
  const [group, setGroup] = useState(null)

  const load = async () => {
    try {
      const entry = await SubmissionService.getSubmission(id)
      setSubmission(entry)
      const groupEntry = await GroupService.getGroup(entry.info.group)
      setGroup(groupEntry)
    } catch (error) {

    }
  }

  const reload = async () => {
    await load()
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Submission' content='width=device-width, initial-scale=1.0' />
        <title>Submission from {group ? group.name : ''}</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column' style={{ flexGrow: 3 }}>
          <SubmissionSection submission={submission} onEndorse={reload} onApprove={reload} />
          <CommentSection submission={submission} />
        </div>
        <div className='tm-column'>
          <GroupInfoSection title='Submitter Info' group={group} />
        </div>
      </div>
    </>
  )
}

export default SubmissionPage
