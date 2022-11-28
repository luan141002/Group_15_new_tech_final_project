import { cloneDeep, merge } from "lodash"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Alert, Button, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from 'reactstrap'
import { useAccount, checkAccount } from "../../providers/account"
import AssignmentService from '../../services/AssignmentService'
import dayjs from 'dayjs'

const createFormState = () => {
  return {
    name: '',
    description: '',
    deadline: '',
    published: false,
    dueDate: '',
    dueTime: ''
  }
}

const dateToString = (date) => {
  if (date instanceof Date) {
    const offset = date.getTimezoneOffset()
    date = new Date(date.getTime() - (offset*60*1000))
    return date.toISOString().split('T')[0]
  }

  return date
}

function SubmissionBoxesSection(props) {
  const { readonly, getLink, viewAll } = props

  const { account } = useAccount()
  const accountCanEdit = checkAccount(account, [ 'faculty.coordinator', 'administrator' ]) && !readonly

  const [form, setForm] = useState(createFormState())
  const [formOpen, setFormOpen] = useState(false)
  const [formId, setFormId] = useState('')
  const [formError, setFormError] = useState('')
  const [deleteId, setDeleteId] = useState('')
  const [deleteFormOpen, setDeleteFormOpen] = useState(false)
  const [deleteFormError, setDeleteFormError] = useState('')
  const [publishFormOpen, setPublishFormOpen] = useState(false)
  const [publishFormError, setPublishFormError] = useState('')
  const [entries, setEntries] = useState([])

  const updateForm = (partial) => {
    setForm(prev => merge(cloneDeep(prev), partial))
  }

  const updateFormField = (name) => (event) => {
    const value = event.target.value
    updateForm({ [name]: value })
  }

  const openModal = (data) => () => {
    setFormId(data ? data._id : '')
    setForm(data || createFormState())
    setFormOpen(true)
  }

  const openDeleteModal = (id) => () => {
    setDeleteId(id)
    setDeleteFormOpen(true)
  }

  const closeModal = () => {
    setFormError('')
    setFormOpen(false)
    setDeleteId('')
    setDeleteFormError('')
    setDeleteFormOpen(false)
    setPublishFormError('')
    setPublishFormOpen(false)
  }

  const getTime = (dt) => {
    if (typeof dt === 'string') dt = new Date(dt)
    const hr = dt.getHours().toString().padStart(2, '0')
    const mn = dt.getMinutes().toString().padStart(2, '0')
    return `${hr}:${mn}`
  }

  const getDate = (dt) => {
    if (typeof dt === 'string') dt = new Date(dt)
    const yr = dt.getFullYear().toString().padStart(4, '0')
    const mn = (dt.getMonth() + 1).toString().padStart(2, '0')
    const dy = dt.getDate().toString().padStart(2, '0')
    return `${yr}-${mn}-${dy}`
  }

  const setDateTime = (d,t) => {
    const [yr,mt,dy] = d.split('-').map(e => Number.parseInt(e, 10))
    const [hr,mn] = t.split(':').map(e => Number.parseInt(e, 10))

    return new Date(yr, mt - 1, dy, hr, mn)
  }

  const updateDueDate = (event) => {
    updateForm(prev => ({
      due: setDateTime(getDate(event.target.value), getTime(prev.due))
    }))
  }

  const updateDueTime = (event) => {
    updateForm(prev => ({
      due: setDateTime(getDate(prev.due), getTime(event.target.value))
    }))
  }

  const canEdit = () => viewAll && accountCanEdit

  const load = async() => {
    try {
      const entryList = await AssignmentService.getAssignments(canEdit())
      setEntries(entryList.map(e => ({
        ...e,
        dueDate: getDate(e.due),
        dueTime: getTime(e.due)
      })))
    } catch (error) {

    }
  }

  const onAdd = async () => {
    try {
      if (formId) {
        await AssignmentService.updateAssignment(formId, {
          name: form.name,
          description: form.description,
          due: setDateTime(form.dueDate, form.dueTime)
        })
      } else {
        await AssignmentService.createAssignment({
          name: form.name,
          description: form.description,
          due: setDateTime(form.dueDate, form.dueTime)
        })
      }
      await load()
      closeModal()
    } catch (error) {
      setFormError(error.message)
    }
  }

  const onPublish = async () => {
    try {
      await AssignmentService.publishAssignment(formId)
      await load()
      closeModal()
    } catch (error) {
      setFormError(error.message)
    }
  }

  const onDelete = async () => {
    try {
      await AssignmentService.deleteAssignment(deleteId)
      await load()
      closeModal()
    } catch (error) {
      setDeleteFormError(error.message)
    }
  }

  const doGetLink = (submission) => {
    if (getLink) return getLink(submission)
    return null
  }
  
  useEffect(() => {
    load()
  }, [])

  return (
    <>
      {
        accountCanEdit && <>
          <Modal isOpen={formOpen} fade={false} centered scrollable size='lg'>
            <ModalHeader>{ formId ? 'Update' : 'Create' } submission box</ModalHeader>
            <ModalBody>
              <FormGroup floating>
                <Input id='assignment-name' type='text' name='name' placeholder='Name' value={form.name} onChange={updateFormField('name')} />
                <Label for='assignment-name'>Name</Label>
              </FormGroup>
              <FormGroup floating>
                <Input id='assignment-description' type='textarea' name='description' placeholder='Description' value={form.description} onChange={updateFormField('description')} />
                <Label for='assignment-description'>Description</Label>
              </FormGroup>
              <Row>
                <Col>
                  <FormGroup floating>
                    <Input id='assignment-duedate' type='date' name='duedate' value={form.dueDate} onChange={updateFormField('dueDate')} />
                    <Label for='assignment-duedate'>Due Date</Label>
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup floating>
                    <Input id='assignment-duetime' type='time' name='duetime' value={form.dueTime} onChange={updateFormField('dueTime')} />
                    <Label for='assignment-duetime'>Due Time</Label>
                  </FormGroup>
                </Col>
              </Row>
              { formError && <Alert color='danger'>{formError}</Alert> }
            </ModalBody>
            <ModalFooter>
              { formId && <Button disabled={form.published} onClick={() => setPublishFormOpen(true)}>{ form.published ? 'Already published' : 'Publish'}</Button> }
              <Button onClick={onAdd}>{ formId ? 'Update' : 'Create'}</Button>
              <Button onClick={closeModal}>Close</Button>
            </ModalFooter>
          </Modal>
          <Modal isOpen={publishFormOpen} fade={false} centered scrollable>
            <ModalHeader>Publish submission box</ModalHeader>
            <ModalBody>
              This will make the submission box visible to all students. This action cannot be undone.
              { publishFormError && <Alert color='danger'>{publishFormError}</Alert> }
            </ModalBody>
            <ModalFooter>
              <Button onClick={onPublish}>Publish</Button>
              <Button onClick={closeModal}>Close</Button>
            </ModalFooter>
          </Modal>
          <Modal isOpen={deleteFormOpen} fade={false} centered scrollable>
            <ModalHeader>Delete submission box</ModalHeader>
            <ModalBody>
              This action cannot be undone.
              { deleteFormError && <Alert color='danger'>{deleteFormError}</Alert> }
            </ModalBody>
            <ModalFooter>
              <Button onClick={onDelete} color='danger'>Delete</Button>
              <Button onClick={closeModal}>Close</Button>
            </ModalFooter>
          </Modal>
        </>
      }
      <div className='tm-group'>
        <h2 className="tm-group-name">Submission Boxes</h2>
        { accountCanEdit && <Button onClick={openModal()}>Create</Button> }
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Due</th>
              { canEdit() && <th>Published</th> }
              { canEdit() && <th>Actions</th> }
            </tr>
          </thead>
          <tbody>
            {
              entries.map(e => {
                return (
                  <tr>
                    <td><Link to={doGetLink(e) || '#'}>{e.name}</Link></td>
                    <td>{dayjs(e.due).format('lll')}</td>
                    { canEdit() && <td>{e.published ? 'Yes' : 'No'}</td> }
                    {
                      canEdit() && <td>
                        <Button onClick={openModal(e)} size='sm' className='me-1'>Edit</Button>
                        <Button onClick={openDeleteModal(e._id)} color='danger' size='sm'>Delete</Button>
                      </td>
                    }
                  </tr>
                )
              })
            }
          </tbody>
        </Table>
      </div>
    </>
  )
}

export default SubmissionBoxesSection
