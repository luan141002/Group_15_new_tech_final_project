import { clone, merge } from "lodash"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { Alert, Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Table } from "reactstrap"
import ProcessService from "../../services/ProcessService"

function createFormState() {
  return {
    id: '',
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  }
}

function ProcessPage() {
  const [processes, setProcesses] = useState([])
  const [form, setForm] = useState(createFormState())
  const [formId, setFormId] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteFormOpen, setDeleteFormOpen] = useState(false)
  const [deleteFormError, setDeleteFormError] = useState('')
  const [deleteId, setDeleteId] = useState('')

  const updateForm = (partial) => {
    setForm(prev => merge(clone(prev), partial))
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
    setDeleteFormOpen(false)
  }

  const load = async() => {
    try {
      const processList = await ProcessService.getProcesses(true)
      setProcesses(processList)
    } catch (error) {

    }
  }

  const onCreate = async () => {
    try {
      await ProcessService.createProcess(form)
      await load()
      closeModal()
    } catch (error) {
      setFormError(error.message)
    }
  }

  const onDelete = async () => {
    try {
      await ProcessService.deleteProcess(deleteId)
      await load()
      closeModal()
    } catch (error) {
      setDeleteFormError(error.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Processes' content='width=device-width, initial-scale=1.0' />
        <title>Processes</title>
      </Helmet>
      <Modal isOpen={formOpen} fade={false} centered scrollable>
        <ModalHeader>{formId ? 'Edit' : 'Create'} process</ModalHeader>
        <ModalBody>
          <FormGroup floating>
            <Input id='process-name' type='text' name='name' placeholder='Name' value={form.name} onChange={updateFormField('name')} />
            <Label for='process-name'>Name</Label>
          </FormGroup>
          <FormGroup floating>
            <Input id='process-description' type='textarea' name='description' placeholder='Description' value={form.description} onChange={updateFormField('description')} />
            <Label for='process-description'>Description</Label>
          </FormGroup>
          <FormGroup floating>
            <Input id='process-startDate' type='date' name='startDate' placeholder='Start Date' value={form.startDate} onChange={updateFormField('startDate')} />
            <Label for='process-startDate'>Start Date</Label>
          </FormGroup>
          <FormGroup floating>
            <Input id='process-endDate' type='date' name='endDate' placeholder='End Date' value={form.endDate} onChange={updateFormField('endDate')} />
            <Label for='process-endDate'>End Date</Label>
          </FormGroup>
          { formError && <Alert color='danger'>{formError}</Alert> }
        </ModalBody>
        <ModalFooter>
          <Button onClick={onCreate}>Post</Button>
          <Button onClick={closeModal}>Close</Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={deleteFormOpen} fade={false} centered scrollable>
        <ModalHeader>Delete announcement</ModalHeader>
        <ModalBody>
          This action cannot be undone.
          { deleteFormError && <Alert color='danger'>{deleteFormError}</Alert> }
        </ModalBody>
        <ModalFooter>
          <Button onClick={onDelete}>Delete</Button>
          <Button onClick={closeModal}>Close</Button>
        </ModalFooter>
      </Modal>
      <div className='tm-row'>
        <div className='tm-column'>
          <div className='tm-group'>
            <h2 className="tm-group-name">Processes</h2>
            <Button onClick={openModal}>Create process</Button>
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  processes.map(e => (
                    <tr key={`group-${e._id}`}>
                      <td>{e.name}</td>
                      <td>{e.startDate}</td>
                      <td>{e.endDate}</td>
                      <td>
                        <Button onClick={openModal(e)} color='danger' size='sm'>Delete</Button>
                        <Button onClick={openDeleteModal(e._id)} color='danger' size='sm'>Delete</Button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProcessPage
