import { useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet"
import UserService from '../../services/UserService'
import { Alert, Button, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from 'reactstrap'
import { clone, cloneDeep, merge } from "lodash"
import { CopyToClipboard } from "react-copy-to-clipboard"

function createFormState() {
  return {
    idnum: '',
    username: '',
    lastName: '',
    firstName: '',
    email: '',
    roles: [],
    password: ''
  }
}

const roles = (type) => {
  switch (type) {
    case 'student': return []
    case 'faculty': return [
      { name: 'adviser', display: 'Adviser' },
      { name: 'panelist', display: 'Panelist' },
      { name: 'coordinator', display: 'Coordinator' }
    ]
    case 'administrator': return [
      { name: 'chair', display: 'Chair' },
      { name: 'secretary', display: 'Secretary' }
    ]
    default: return []
  }
}

function MembersPage() {
  const [deleteForm, setDeleteForm] = useState(false)
  const [deleteType, setDeleteType] = useState('')
  const [deleteId, setDeleteId] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [admins, setAdmins] = useState([])
  const [faculty, setFaculty] = useState([])
  const [students, setStudents] = useState([])
  const [isFormOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(createFormState())
  const [formId, setFormId] = useState('')
  const [formType, setFormType] = useState('')
  const [formError, setFormError] = useState('')
  const [copied, setCopied] = useState(false)
  const verifyRef = useRef(null)

  const updateForm = (partial) => {
    setForm(prev => merge(cloneDeep(prev), partial))
  }

  const updateFormField = (name) => (event) => {
    const value = event.target.value
    updateForm({ [name]: value })
  }

  const updateFormRoleField = (name) => (event) => {
    const value = event.target.checked
    setForm(prev => {
      const next = cloneDeep(prev)
      if (value) { if (!next.roles.includes(name)) next.roles.push(name) }
      else next.roles = next.roles.filter(e => e !== name)
      return next
    })
  }

  const openModal = (type, data) => () => {
    setCopied(false)
    setFormId(data ? data._id : '')
    setFormType(type)
    setForm(data || createFormState())
    setFormOpen(true)
  }

  const openDeleteModal = (type, id) => () => {
    setDeleteType(type)
    setDeleteId(id)
    setDeleteForm(true)
  }

  const closeModal = () => {
    setFormError('')
    setFormType('')
    setFormOpen(false)
    setDeleteType('')
    setDeleteId('')
    setDeleteForm(false)
  }

  const loadType = async(type) => {
    switch (type) {
      case 'administrator':
        try {
          const adminList = await UserService.getUsers('administrator')
          setAdmins(adminList)
        } catch (error) {
          console.log(error)
        }
        break
      case 'faculty':
        try {
          const facultyList = await UserService.getUsers('faculty')
          setFaculty(facultyList)
        } catch (error) {
          console.log(error)
        }
        break
      case 'student':
        try {
          const studentsList = await UserService.getUsers('student')
          setStudents(studentsList)
        } catch (error) {
          console.log(error)
        }
        break
      default: break
    }
  }

  const onAdd = async (event) => {
    try {
      if (formId) {
        await UserService.updateUser(formType, formId, form)
      } else {
        await UserService.addUser(formType, form)
      }
      await loadType(formType)
      closeModal()
    } catch (error) {
      setFormError(error.message)
    }
  }

  const onDelete = async (event) => {
    try {
      await UserService.deleteUser(deleteType, deleteId)
      await loadType(deleteType)
      closeModal()
    } catch (error) {
      setDeleteError(error.message)
    }
  }

  const loadAll = async() => {
    await loadType('administrator')
    await loadType('faculty')
    await loadType('student')
  }
  
  useEffect(() => {
    loadAll()
  }, [])
  
  const copyVerifyLink = () => {
    alert('Copied!')
  }

  const rolesList = roles(formType)
  const rolesLayout = rolesList.length > 0 ?
    <>
      <Row>
        <Col>
          <Label>Roles</Label>
        </Col>
      </Row>
      <Row>
        {
          rolesList.map((role, i) => (
            <Col key={`role-${i}`}>
              <FormGroup check>
                <Input id={`account-role${i}`} type='checkbox' name={`role${i}`} checked={form.roles.includes(role.name)} onChange={updateFormRoleField(role.name)} />
                <Label for={`account-role${i}`}>{role.display}</Label>
              </FormGroup>
            </Col>
          ))
        }
      </Row>
    </>
  : <></>

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Members' content='width=device-width, initial-scale=1.0' />
        <title>Members</title>
      </Helmet>
      <Modal isOpen={isFormOpen} fade={false} centered scrollable size='lg'>
        <ModalHeader>{formId ? 'Edit' : 'Add'} {formType}</ModalHeader>
        <ModalBody>
          { formType === 'administrator' && 'If you add another administrator, you cannot update their information nor remove them.' }
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
          {rolesLayout}
          { formError && <Alert color='danger'>{formError}</Alert> }
        </ModalBody>
        <ModalFooter>
          {
            formType === 'student' && formId && <>
              <CopyToClipboard text={`${window.location.origin}/verify?username=${encodeURIComponent(form.username)}&verifyCode=${encodeURIComponent(form.verifyCode)}`} onCopy={copyVerifyLink}>
                <Button>Copy verification link</Button>
              </CopyToClipboard>
            </>
          }
          <Button onClick={onAdd}>{formId ? 'Update' : 'Add'}</Button>
          <Button onClick={closeModal}>Close</Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={deleteForm} fade={false} centered scrollable>
        <ModalHeader>Remove {formType}</ModalHeader>
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
          <div className='tm-group'>
            <h2 className="tm-group-name">Administrators</h2>
            <Button onClick={openModal('administrator')}>Add</Button>
            <Table>
              <thead>
                <tr>
                  <th>ID Number</th>
                  <th>Username</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {
                  admins.map(e => (
                    <tr key={`admin-${e.idnum}`}>
                      <td>{e.idnum}</td>
                      <td>{e.username}</td>
                      <td>{`${e.lastName}, ${e.firstName}`}</td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
          </div>
          <div className="tm-group">
            <h2 className="tm-group-name">Faculty</h2>
            <Button onClick={openModal('faculty')}>Add</Button>
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
                  faculty.map(e => (
                    <tr key={`faculty-${e.idnum}`}>
                      <td>{e.idnum}</td>
                      <td>{e.username}</td>
                      <td>{`${e.lastName}, ${e.firstName}`}</td>
                      <td>
                        <Button onClick={openModal('faculty', e)} size='sm' className='me-1'>Edit</Button>
                        <Button onClick={openDeleteModal('faculty', e.idnum)} color='danger' size='sm'>Delete</Button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
          </div>
          <div className="tm-group">
            <h2 className="tm-group-name">Students</h2>
            <Button onClick={openModal('student')}>Add</Button>
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
                        <Button onClick={openModal('student', e)} size='sm' className='me-1'>Edit</Button>
                        <Button onClick={openDeleteModal('student', e.idnum)} color='danger' size='sm'>Delete</Button>
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
