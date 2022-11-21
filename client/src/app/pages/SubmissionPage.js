import { clone } from "lodash"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { useParams } from "react-router"
import { Link } from "react-router-dom"
import { Button, FormGroup, Input, Label } from "reactstrap"
import AssignmentService from "../services/AssignmentService"
import SubmissionService from "../services/SubmissionService"

function SubmissionPage() {
  const { id } = useParams()
  const [submission, setSubmission] = useState(null)

  const load = async () => {
    try {
      const entry = await SubmissionService.getSubmission(id)
      setSubmission(entry)
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
                <h2 className='tm-group-name'>Submission</h2>
                {
                  submission.documents && (
                    <>
                      <h3>Documents</h3>
                      <ul>
                        {
                          submission.documents.map(e => {
                            return (
                              <li key={`doc-${e._id}`}>
                                <Link to={`/submission/${id}/document/${e._id}`}>{e.filename}</Link>
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
