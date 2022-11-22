import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { useAccount, checkAccount } from "../../providers/account"
import AssignmentService from "../../services/AssignmentService"
import GroupService from "../../services/GroupService"
import SubmissionService from "../../services/SubmissionService"

const createFormState = () => ({
  title: '',
  type: '',
  message: '',
  button: ''
})

const dateToString = (date) => {
  if (date instanceof Date) {
    const offset = date.getTimezoneOffset()
    date = new Date(date.getTime() - (offset*60*1000))
    return date.toISOString().split('T')[0]
  }

  return date
}

function SubmissionSection(props) {
  const { submission } = props
  const { account } = useAccount()

  const [assignment, setAssignment] = useState(null)
  const [group, setGroup] = useState(null)
  const [submitter, setSubmitter] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(createFormState())
  const [formError, setFormError] = useState('')

  const canEndorse = () => {
    const inRole = checkAccount(account, 'faculty.adviser')
    const isAdviser = group && group.advisers.map(e => e.id).includes(account.info.id)
    const isEndorsed = submission.info.endorsements.some(e => e.by === account.info.id)
    return !isEndorsed && inRole && isAdviser
  }

  const canApprove = () => {
    const inRole = checkAccount(account, 'faculty.coordinator')
    const isApproved = !!submission.info.approvalBy
    const endorsedByAll = group && group.advisers.every(e => submission.info.endorsements.some(e2 => e2.by === e.id))
    return !isApproved && endorsedByAll && inRole
  }

  const findMember = (group, id) => group ? group.members.find(e => e.id === id) : {}
  const findAdviser = (group, id) => group ? group.advisers.find(e => e.id === id) : {}

  const load = async () => {
    if (!submission) return
    try {
      const groupEntry = await GroupService.getGroup(submission.info.group)
      setGroup(groupEntry)
      const entry2 = await AssignmentService.getAssignment(submission.info.assignment)
      setAssignment(entry2)
      setSubmitter(findMember(groupEntry, submission.info.submitter))
    } catch (error) {

    }
  }

  const onDownload = (did, fn) => async () => {
    try {
      const doc = await SubmissionService.getDocument(submission.info._id, did, true)
      const link = document.createElement('a')
      link.target = '_blank'
      link.download = fn
      link.href = URL.createObjectURL(doc)
      link.click()
    } catch (error) {

    }
  }

  const openModal = (type) => {
    let title = ''
    let message = ''
    let button = ''
    switch (type) {
      case 'endorse':
        title = 'Endorse submission'
        message = 'Once endorsed, you cannot reverse this.'
        button = 'Endorse'
        break
      case 'approve':
        title = 'Approve submission'
        message = 'Once approved, you cannot reverse this.'
        button = 'Approve'
        break
      default: return
    }

    setForm({
      type,
      title,
      message,
      button
    })
    setFormError('')
    setFormOpen(true)
  }

  const closeModal = () => {
    setFormOpen(false)
    setForm(createFormState())
  }

  const endorseSubmission = async () => {
    await SubmissionService.endorseSubmission(submission.info._id)
  }

  const approveSubmission = async () => {
    await SubmissionService.approveSubmission(submission.info._id)
  }

  const onSubmit = async () => {
    try {
      switch (form.type) {
        case 'endorse':
          await endorseSubmission()
          break
        case 'approve':
          await approveSubmission()
          break
        default: return
      }

      await load()
      closeModal()
    } catch (error) {
      setFormError(error.message)
    }
  }

  useEffect(() => {
    load()
  }, [submission])

  return <>
    <Modal isOpen={formOpen} fade={false} centered scrollable>
      <ModalHeader>{form.title}</ModalHeader>
      <ModalBody>
        {form.message}
        { formError && <Alert color='danger'>{formError}</Alert> }
      </ModalBody>
      <ModalFooter>
        <Button onClick={onSubmit}>{form.button}</Button>
        <Button onClick={() => closeModal()}>Close</Button>
      </ModalFooter>
    </Modal>
    <div className='tm-group'>
      <h2 className="tm-group-name">Submission { assignment && `for ${assignment.name}` }</h2>
      {
        submission && <>
          <p className='tm-group-subname'>
            { submitter && `${submitter.firstName} ${submitter.lastName} submitted on ${submission.info.submitDate}` }
          </p>
          {
            submission.documents && (
              <>
                <h3>Documents</h3>
                <ul>
                  {
                    submission.documents.map(e => {
                      return (
                        <li key={`doc-${e._id}`}>
                          <Link to={`/faculty/submissions/${submission.info._id}/document/${e._id}`}>{e.filename}</Link>
                          <Button color='link' onClick={onDownload(e._id, e.filename)}>Download</Button>
                        </li>
                      )
                    })
                  }
                </ul>
                {
                  (submission.info.endorsements || canEndorse()) && <>
                    <h3>Endorsements</h3>
                    <ul>
                      {
                        submission.info.endorsements && submission.info.endorsements.map(e => {
                          const adviser = findAdviser(group, e.by)
                          return (
                            <li key={`endorser-${e.by}`}>
                              {`${adviser.firstName} ${adviser.lastName} on ${e.when}`}
                            </li>
                          )
                        })
                        
                      }
                    </ul>
                    {
                      canEndorse() && <>
                        <Button onClick={() => openModal('endorse')}>Endorse</Button>
                      </>
                    }
                  </>
                }
                {
                  (submission.info.approvalBy || canApprove()) && <>
                    <h3>Approvals</h3>
                    {
                      submission.info.approvalBy && <>
                        <p>{`${submission.info.approvalBy.firstName} ${submission.info.approvalBy.lastName} on ${submission.info.approvalDate}`}</p>
                      </>
                    }
                    {
                      canApprove() && <>
                        <Button onClick={() => openModal('approve')}>Approve</Button>
                      </>
                    }
                  </>
                }
              </>
            )
          }
        </>
      }
    </div>
  </>
}

export default SubmissionSection