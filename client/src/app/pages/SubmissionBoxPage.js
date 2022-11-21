import { clone } from "lodash"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { useParams } from "react-router"
import { Link } from "react-router-dom"
import { Button, FormGroup, Input, Label } from "reactstrap"
import AssignmentService from "../services/AssignmentService"
import SubmissionService from "../services/SubmissionService"

function SubmissionBoxPage() {
  const { id } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [files, setFiles] = useState([])
  const [file, setFile] = useState('')

  const toggleSubmitting = () => {
    const next = !submitting
    if (!next) {
      setFiles([])
    }

    setSubmitting(next)
  }

  const addFile = (event) => {
    const files = event.target.files
    const file = files[0]
    if (file) {
      setFile('')
      setFiles(prev => {
        const next = clone(prev)
        next.push(file)
        console.log(next)
        return next
      })
    }
  }

  const load = async () => {
    try {
      const entry = await AssignmentService.getAssignment(id)
      setAssignment(entry)
      const subs = await SubmissionService.getStudentSubmissions(id)
      setSubmissions(subs)
    } catch (error) {

    }
  }

  const onSubmit = async () => {
    try {
      await SubmissionService.uploadSubmission(id, files)
      setSubmitting(false)
      setFiles([])
      setFile('')

      load()
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
        <meta name='Submission Box' content='width=device-width, initial-scale=1.0' />
        <title>{ assignment ? assignment.name : 'Submission box' }</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column'>
          {
            assignment && (
              <div className='tm-group'>
                <h2 className='tm-group-name'>{ assignment.name }</h2>
                <p>{ assignment.description }</p>
                {
                  submissions && (
                    <>
                      <h3>Submissions</h3>
                      <ul>
                        {
                          submissions.map(e => {
                            return (
                              <li key={`sub-${e._id}`}>
                                <Link to={`/submission/${e._id}`}>Submission on {e.submitDate}</Link>
                              </li>
                            )
                          })
                        }
                      </ul>
                    </>
                  )
                }
                <Button onClick={toggleSubmitting}>{ submitting ? 'Stop uploading' : 'Upload files' }</Button>
                {
                  submitting && (
                    <>
                      <ul>
                        {
                          files.map((e, idx) => {
                            return (
                              <li key={`file-${idx}`}>
                                {e.name}
                              </li>
                            )
                          })
                        }
                      </ul>
                      {
                        files.length < 10 && (
                          <FormGroup>
                            <Label for="file">
                              Upload {files.length > 0 ? 'additional' : ''} file
                            </Label>
                            <Input
                              id="file"
                              name="file"
                              type="file"
                              value={file}
                              onChange={addFile}
                            />
                          </FormGroup>
                        )
                      }
                      <Button onClick={onSubmit}>Submit</Button>
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

export default SubmissionBoxPage
