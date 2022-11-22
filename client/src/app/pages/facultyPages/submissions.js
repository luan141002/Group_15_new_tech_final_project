import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import SubmissionBoxesSection from "../../components/sections/SubmissionBoxesSection"
import AssignmentService from "../../services/AssignmentService"

function FacultySubmissionsPage() {
  const [groups, setGroups] = useState([])

  async function load() {
    try {
      
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
        <meta name='Submissions' content='width=device-width, initial-scale=1.0' />
        <title>Submissions</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column'>
          <SubmissionBoxesSection />
          <div className='tm-group'>
            <h2 className='tm-group-name'>Groups with submissions</h2>
          </div>
        </div>
      </div>
    </>
  )
}

export default FacultySubmissionsPage
