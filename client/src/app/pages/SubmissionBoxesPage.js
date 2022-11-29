import dayjs from "dayjs"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { Link } from "react-router-dom"
import { Card, CardBody, CardSubtitle, CardText, CardTitle, Table } from "reactstrap"
import AssignmentService from "../services/AssignmentService"
import SubmissionService from "../services/SubmissionService"

function SubmissionBoxesPage() {
  const [submissions, setSubmissions] = useState([])
  const [assignments, setAssignments] = useState([])

  const load = async () => {
    try {
      const assignments = await AssignmentService.getAssignments()
      setAssignments(assignments)
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
        <meta name='Submission Boxes' content='width=device-width, initial-scale=1.0' />
        <title>Submission boxes</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column'>
          <div className='tm-group'>
            <h2 className='tm-group-name'>My Submissions</h2>
            {
              submissions.map(e => (
                <Card className='mt-2'>
                  <CardBody>
                    <CardTitle><Link to={`/submissions/${e._id}`} className='stretched-link'>{e.assignment.name}</Link></CardTitle>
                    <CardSubtitle>Submitted by {`${e.submitter.firstName} ${e.submitter.lastName}`} on {dayjs(e.submitDate).format('lll')}</CardSubtitle>
                  </CardBody>
                </Card>
              ))
            }
          </div>
          <div className='tm-group'>
            <h2 className='tm-group-name'>Submission Boxes</h2>
            {
              assignments.map(e => (
                <Card className='mt-2'>
                  <CardBody>
                    <CardTitle><Link to={`/assignment/${e._id}`} className='stretched-link'>{e.name}</Link></CardTitle>
                    <CardText>{e.description}</CardText>
                  </CardBody>
                </Card>
              ))
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default SubmissionBoxesPage
