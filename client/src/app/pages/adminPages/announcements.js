import { clone, merge } from "lodash"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { Alert, Button, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Table } from "reactstrap"
import AnnouncementService from "../../services/AnnouncementService"
import dayjs from 'dayjs'

function createFormState() {
  return {
    title: '',
    message: ''
  }
}

function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [form, setForm] = useState(createFormState())
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

  const openModal = () => {
    setForm(createFormState())
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
      const announcementList = await AnnouncementService.getAllAnnouncements()
      setAnnouncements(announcementList)
    } catch (error) {

    }
  }

  const onCreate = async () => {
    try {
      await AnnouncementService.createAnnouncement(form)
      await load()
      closeModal()
    } catch (error) {
      setFormError(error.message)
    }
  }

  const onDelete = async () => {
    try {
      await AnnouncementService.deleteAnnouncement(deleteId)
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
        <meta name='Announcements' content='width=device-width, initial-scale=1.0' />
        <title>Announcements</title>
      </Helmet>
      <Modal isOpen={formOpen} fade={false} centered scrollable>
        <ModalHeader>Post announcement</ModalHeader>
        <ModalBody>
          <FormGroup floating>
            <Input id='announcement-title' type='text' name='title' placeholder='Title' value={form.title} onChange={updateFormField('title')} />
            <Label for='announcement-title'>Title</Label>
          </FormGroup>
          <FormGroup floating>
            <Input id='announcement-message' type='textarea' name='message' placeholder='Message' value={form.message} onChange={updateFormField('message')} />
            <Label for='announcement-message'>Message</Label>
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
            <h2 className="tm-group-name">Announcements</h2>
            <Button onClick={openModal}>Post announcement</Button>
            <Table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Post date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  announcements.map(e => (
                    <tr key={`group-${e._id}`}>
                      <td>{e.title}</td>
                      <td>{dayjs(e.uploadDate).format('lll')}</td>
                      <td>
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

export default AnnouncementsPage
