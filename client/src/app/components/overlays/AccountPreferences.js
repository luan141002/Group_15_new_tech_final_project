import { cloneDeep, merge } from 'lodash'
import { useEffect, useState } from 'react'
import { Alert, Button, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap'
import UserService from '../../services/UserService'

const createFormState = () => ({
  current: '',
  password: '',
  confirm: ''
})

function AccountPreferences(props) {
  const { isOpen, onClose, className, overlayName, ...otherProps } = props
  const [form, setForm] = useState(createFormState())
  const [formError, setFormError] = useState('')
  const [file, setFile] = useState('')
  const [tmpfile, setTmpFile] = useState('')
  const [fileurl, setFileUrl] = useState('')
  const [changed, setChanged] = useState(false)
  const [ok, setOk] = useState(false)

  const updateForm = (partial) => {
    setForm(prev => merge(cloneDeep(prev), partial))
    setChanged(true)
  }

  const updateFormField = (name) => (event) => {
    const value = event.target.value
    updateForm({ [name]: value })
  }

  const addFile = (event) => {
    const files = event.target.files
    const file = files[0]
    if (file) {
      setTmpFile('')
      setFile(file)
      setFileUrl(URL.createObjectURL(file))
      setChanged(true)
    }
  }

  const tryApply = async () => {
    if (changed) {
      try {
        setOk(false)
        setFormError('')
        await UserService.updateUserPrefs({
          current: form.current,
          password: form.password,
          confirm: form.confirm,
          photo: file
        })
        setForm(createFormState())
        setChanged(false)
        setOk(true)
      } catch (error) {
        setFormError(error.message)
      }
    }
  }

  const tryClose = () => {
    if (onClose) onClose()
  }

  useEffect(() => {
    if (isOpen) {
      setOk(false)
      setChanged(false)
      setFormError('')
      setForm(createFormState())
      setTmpFile('')
      setFile('')
      setFileUrl('')
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} fade={false} centered scrollable size='lg'>
      <ModalHeader>Account Preferences</ModalHeader>
      <ModalBody>
        <h5>Password</h5>
        <FormGroup floating>
          <Input id='prefs-current' type='password' name='current' placeholder='Current Password' value={form.current} onChange={updateFormField('current')} />
          <Label for='prefs-current'>Current Password</Label>
        </FormGroup>
        <FormGroup floating>
          <Input id='prefs-password' type='password' name='password' placeholder='New Password' value={form.password} onChange={updateFormField('password')} />
          <Label for='prefs-password'>New Password</Label>
        </FormGroup>
        <FormGroup floating>
          <Input id='prefs-confirm' type='password' name='confirm' placeholder='Confirm Password' value={form.confirm} onChange={updateFormField('confirm')} />
          <Label for='prefs-confirm'>Confirm Password</Label>
        </FormGroup>
        <h5>Photo</h5>
        <FormGroup inline>
          <Row>
            <Col>
              <Label for="file">Upload photo</Label>
              <Input
                id="file"
                name="file"
                type="file"
                value={tmpfile}
                onChange={addFile}
                accept="image/*"
                width='100%'
              />
            </Col>
            <Col>
              <div>
                {fileurl && <img className='img-thumbnail rounded' width={200} height={200} src={fileurl} alt='Profile' />}
              </div>
            </Col>
          </Row>
        </FormGroup>
        { ok && <Alert color='success'>Account preferences changed!</Alert> }
        { formError && <Alert color='danger'>{formError}</Alert> }
      </ModalBody>
      <ModalFooter>
        <Button disabled={!changed} onClick={tryApply}>Apply</Button>
        <Button onClick={tryClose}>Close</Button>
      </ModalFooter>
    </Modal>
  )
}

export default AccountPreferences
