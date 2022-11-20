import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import UserService from '../../services/UserService'
import { Alert, Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap'
import { clone, merge } from "lodash"

function createFormState() {
  return {
    idnum: '',
    username: '',
    lastName: '',
    firstName: '',
    email: '',
    password: ''
  }
}

function MembersPage() {
  const [formMode, setFormMode] = useState('')
  const [deleteForm, setDeleteForm] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [students, setStudents] = useState([])
  const [isFormOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(createFormState())
  const [formError, setFormError] = useState('')

  const updateForm = (partial) => {
    setForm(prev => merge(clone(prev), partial))
  }

  const updateFormField = (name) => (event) => {
    const value = event.target.value
    updateForm({ [name]: value })
  }

  const openModal = (data) => () => {
    setFormMode(data ? 'Edit' : 'Add')
    setForm(data || createFormState())
    setFormOpen(true)
  }

  const openDeleteModal = (id) => () => {
    setDeleteId(id)
    setDeleteForm(true)
  }

  const closeModal = () => {
    setFormError('')
    setFormOpen(false)
    setDeleteId('')
    setDeleteForm(false)
  }

  const loadStudents = async () => {
    try {
      const studentsList = await UserService.getUsers('student')
      setStudents(studentsList)
    } catch (error) {
      console.log(error)
    }
  }

  const onAdd = async (event) => {
    try {
      await UserService.addUser('student', form)
      await loadStudents()
      closeModal()
    } catch (error) {
      setFormError(error.message)
    }
  }

  const onDelete = async (event) => {
    try {
      await UserService.deleteUser('student', deleteId)
      await loadStudents()
      closeModal()
    } catch (error) {
      setDeleteError(error.message)
    }
  }
  
  useEffect(() => {
    loadStudents()
  }, [])

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Members' content='width=device-width, initial-scale=1.0' />
        <title>Members</title>
      </Helmet>
      <Modal isOpen={isFormOpen} fade={false} centered scrollable>
        <ModalHeader>{formMode} student</ModalHeader>
        <ModalBody>
          <FormGroup floating>
            <Input id='account-idnum' type='text' name='idnum' placeholder='ID Number' value={form.idnum} onChange={updateFormField('idnum')} />
            <Label for='account-idnum'>ID Number</Label>
          </FormGroup>
          <FormGroup floating>
            <Input id='account-username' type='text' name='username' placeholder='Username' value={form.username} onChange={updateFormField('username')} />
            <Label for='account-username'>Username</Label>
          </FormGroup>
          <FormGroup floating>
            <Input id='account-lastName' type='text' name='lastName' placeholder='Last Name' value={form.lastName} onChange={updateFormField('lastName')} />
            <Label for='account-lastName'>Last Name</Label>
          </FormGroup>
          <FormGroup floating>
            <Input id='account-firstName' type='text' name='firstName' placeholder='First Name' value={form.firstName} onChange={updateFormField('firstName')} />
            <Label for='account-firstName'>First Name</Label>
          </FormGroup>
          <FormGroup floating>
            <Input id='account-middleName' type='text' name='middleName' placeholder='Middle Name' value={form.middleName} onChange={updateFormField('middleName')} />
            <Label for='account-middleName'>Middle Name</Label>
          </FormGroup>
          <FormGroup floating>
            <Input id='account-email' type='email' name='email' placeholder='Email' value={form.email} onChange={updateFormField('email')} />
            <Label for='account-email'>Email</Label>
          </FormGroup>
          <FormGroup floating>
            <Input id='account-password' type='password' name='password' placeholder='Password' value={form.password} onChange={updateFormField('password')} />
            <Label for='account-password'>Password</Label>
          </FormGroup>
          { formError && <Alert color='danger'>{formError}</Alert> }
        </ModalBody>
        <ModalFooter>
          <Button onClick={onAdd}>Add</Button>
          <Button onClick={closeModal}>Close</Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={deleteForm} fade={false} centered scrollable>
        <ModalHeader>Remove student</ModalHeader>
        <ModalBody>
          This action cannot be undone.
          { deleteError && <Alert color='danger'>{deleteError}</Alert> }
        </ModalBody>
        <ModalFooter>
          <Button onClick={onDelete}>Delete</Button>
          <Button onClick={() => setDeleteForm(false)}>Close</Button>
        </ModalFooter>
      </Modal>
      <div className='tm-row'>
        <div className='tm-column'>
          <div className="tm-group">
            <h2 className="tm-group-name">Students</h2>
            <Button onClick={openModal()}>Add</Button>
            <Table>
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  students.map(e => (
                    <tr key={`student-${e.idnum}`}>
                      <td>{e.idnum}</td>
                      <td>{e.username}</td>
                      <td>{`${e.lastName}, ${e.firstName}`}</td>
                      <td>
                        <Button onClick={openModal(e)} size='sm' className='me-1'>Edit</Button>
                        <Button onClick={openDeleteModal(e.idnum)} color='danger' size='sm'>Delete</Button>
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

export default MembersPage
