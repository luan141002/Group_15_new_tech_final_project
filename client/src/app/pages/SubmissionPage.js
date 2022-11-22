import { clone } from "lodash"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { useParams } from "react-router"
import { Link } from "react-router-dom"
import { Button, FormGroup, Input, Label } from "reactstrap"
import AssignmentService from "../services/AssignmentService"
import SubmissionService from "../services/SubmissionService"
import GroupService from '../services/GroupService'
import { useAccount } from "../providers/account"

function SubmissionPage() {
  const { id } = useParams()
  const { account } = useAccount()

  const [assignment, setAssignment] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [group, setGroup] = useState(null)
  const [submitter, setSubmitter] = useState(null)

  const findMember = (id) => group.members.find(e => e.id === id)

  const load = async () => {
    try {
      const entry = await SubmissionService.getSubmission(id)
      setSubmission(entry)
      const entry2 = await AssignmentService.getAssignment(entry.info.assignment)
      setAssignment(entry2)
      const groupEntry = await GroupService.getGroup(entry.info.group)
      setGroup(groupEntry)
      setSubmitter(findMember(groupEntry))
    } catch (error) {

    }
  }

  const onDownload = (did, fn) => async () => {
    try {
      const doc = await SubmissionService.getDocument(id, did, true)
      const link = document.createElement('a')
      link.target = '_blank'
      link.download = fn
      link.href = URL.createObjectURL(doc)
      link.click()
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
        <meta name='Submission' content='width=device-width, initial-scale=1.0' />
        <title>Submission</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column'>
          {
            submission && (
              <div className='tm-group'>
                <h2 className='tm-group-name'>{ assignment && assignment.name }</h2>
                <h5 className='tm-group-subname'>{ submitter && `${submitter.lastName}, ${submitter.firstName} submitted on ${submission.submitDate}` }</h5>
                {
                  submission.documents && (
                    <>
                      <h3>Documents</h3>
                      <ul>
                        {
                          submission.documents.map(e => {
                            return (
                              <li key={`doc-${e._id}`}>
                                <Link to={`/submissions/${id}/document/${e._id}`}>{e.filename}</Link>
                                <Button color='link' onClick={onDownload(e._id, e.filename)}>Download</Button>
                              </li>
                            )
                          })
                        }
                      </ul>
                    </>
                  )
                }
              </div>
            )
          }
        </div>
      </div>
    </>
  )
}

export default SubmissionPage
