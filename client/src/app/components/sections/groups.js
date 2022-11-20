import { useEffect, useState } from "react"
import UserService from '../../services/UserService'
import { Alert, Button, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Table } from 'reactstrap'
import { clone, cloneDeep, merge } from "lodash"
import GroupService from "../../services/GroupService"

function createFormState() {
  return {
    name: '',
    members: [],
    advisers: []
  }
}

function GroupsSection() {
  const [deleteForm, setDeleteForm] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [formId, setFormId] = useState('')
  const [groups, setGroups] = useState([])
  const [students, setStudents] = useState([])
  const [faculty, setFaculty] = useState([])
  const [isFormOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(createFormState())
  const [formError, setFormError] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('')

  const findStudent = (_id) => (students.find(e => e._id === _id) || {})
  const findFaculty = (_id) => (faculty.find(e => e._id === _id) || {})

  const updateForm = (partial) => {
    setForm(prev => merge(clone(prev), partial))
  }

  const updateFormField = (name) => (event) => {
    const value = event.target.value
    updateForm({ [name]: value })
  }

  const addMember = () => {
    const selected = selectedStudent
    if (!selected) return

    setForm(prev => {
      const next = cloneDeep(prev)
      if (!next.members.includes(selected)) next.members.push(selected)
      return next
    })
    setSelectedStudent('')
  }

  const removeMember = (id) => () => {
    setForm(prev => {
      const next = cloneDeep(prev)
      next.members = next.members.filter(e => e !== id)
      return next
    })
  }

  const addAdviser = () => {
    const selected = selectedFaculty
    if (!selectedFaculty) return

    setForm(prev => {
      const next = cloneDeep(prev)
      if (!next.advisers.includes(selected)) next.advisers.push(selected)
      return next
    })
    setSelectedFaculty('')
  }

  const removeAdviser = (id) => () => {
    console.log(id)
    setForm(prev => {
      const next = cloneDeep(prev)
      next.advisers = next.advisers.filter(e => e !== id)
      return next
    })
  }

  const openModal = (data) => () => {
    setFormId(data ? data._id : '')
    setForm(data ? {
      name: data.name,
      members: data.members,
      advisers: data.advisers
    } : createFormState())
    setSelectedStudent('')
    setSelectedFaculty('')
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

  const onAdd = async () => {
    try {
      if (formId) {
        await GroupService.updateGroup(formId, form)
      } else {
        await GroupService.createGroup(form)
      }
      await load()
      closeModal()
    } catch (error) {
      setFormError(error.message)
    }
  }

  const onDelete = async () => {
    try {
      await GroupService.deleteGroup(deleteId)
      await load()
      closeModal()
    } catch (error) {
      setDeleteError(error.message)
    }
  }

  const load = async() => {
    try {
      const facultyList = await UserService.getUsers('faculty')
      setFaculty(facultyList)
      const studentsList = await UserService.getUsers('student')
      setStudents(studentsList)
      const groupList = await GroupService.getAllGroups()
      setGroups(groupList)
    } catch (error) {

    }
  }
  
  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <Modal isOpen={isFormOpen} fade={false} centered scrollable>
        <ModalHeader>{formId ? 'Update' : 'Add'} group</ModalHeader>
        <ModalBody>
          <FormGroup floating>
            <Input id='group-name' type='text' name='name' placeholder='Name' value={form.name} onChange={updateFormField('name')} />
            <Label for='group-name'>Name</Label>
          </FormGroup>
          <h3>Members</h3>
          <FormGroup inline>
            <Row>
              <Col sm={9}>
                <Input type='select' placeholder='Add member' value={selectedStudent} onChange={(event) => setSelectedStudent(event.target.value)}>
                  <option value=''>--- Add new member ---</option>
                  {
                    students.map(e => (
                      <option key={e._id} value={e._id}>{`${e.lastName}, ${e.firstName}`}</option>
                    ))
                  }
                </Input>
              </Col>
              <Col sm={3}><Button onClick={addMember} disabled={!selectedStudent}>Add</Button></Col>
            </Row>
          </FormGroup>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                form.members.map(e => findStudent(e)).map(e => (
                  <tr key={`member-${e.idnum}`}>
                    <td>{`${e.lastName}, ${e.firstName}`}</td>
                    <td><Button onClick={removeMember(e._id)} color='danger' size='sm'>Remove</Button></td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
          <h3>Advisers</h3>
          <FormGroup inline>
            <Row>
              <Col sm={9}>
                <Input type='select' placeholder='Add adviser' value={selectedFaculty} onChange={(event) => setSelectedFaculty(event.target.value)}>
                  <option value=''>--- Add new adviser ---</option>
                  {
                    faculty.map(e => (
                      <option key={e._id} value={e._id}>{`${e.lastName}, ${e.firstName}`}</option>
                    ))
                  }
                </Input>
              </Col>
              <Col sm={3}><Button onClick={addAdviser} disabled={!selectedFaculty}>Add</Button></Col>
            </Row>
          </FormGroup>
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                form.advisers.map(e => findFaculty(e)).map(e => (
                  <tr key={`adviser-${e.idnum}`}>
                    <td>{`${e.lastName}, ${e.firstName}`}</td>
                    <td><Button onClick={removeAdviser(e._id)} color='danger' size='sm'>Remove</Button></td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
          { formError && <Alert color='danger'>{formError}</Alert> }
        </ModalBody>
        <ModalFooter>
          <Button onClick={onAdd}>{formId ? 'Update' : 'Add'}</Button>
          <Button onClick={closeModal}>Close</Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={deleteForm} fade={false} centered scrollable>
        <ModalHeader>Delete group</ModalHeader>
        <ModalBody>
          This action cannot be undone.
          { deleteError && <Alert color='danger'>{deleteError}</Alert> }
        </ModalBody>
        <ModalFooter>
          <Button onClick={onDelete}>Delete</Button>
          <Button onClick={() => setDeleteForm(false)}>Close</Button>
        </ModalFooter>
      </Modal>
      <div className='tm-group'>
        <h2 className="tm-group-name">Groups</h2>
        <Button onClick={openModal()}>Add</Button>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {
              groups.map(e => (
                <tr key={`group-${e._id}`}>
                  <td>{e.name}</td>
                  <td>
                    <Button onClick={openModal(e)} size='sm' className='me-1'>Edit</Button>
                    <Button onClick={openDeleteModal(e._id)} color='danger' size='sm'>Delete</Button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </Table>
      </div>
    </>
  )
}

export default GroupsSection
