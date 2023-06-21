import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from '../../providers/account'
import AccountService from '../../services/AccountService';
import PasswordField, { PasswordText, PasswordToggler } from '../../components/PasswordField';
import ProfileImage from '../../components/ProfileImage';
import { useNotification } from '../../contexts/NotificationContext';

function SettingsPage() {
  const { account } = useAccount();
  const { pushNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [type, setType] = useState('');
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(undefined);
  const [image, setImage] = useState(null);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');

  const [time, setTime] = useState(0);
  const imageRef = useRef();

  const load = async () => {
    try {
      setTime(Date.now());
      if (account.accountID) {
        const info = await AccountService.getAccount(account.accountID);
        setEmail(info.email);
        setLastName(info.lastName);
        setFirstName(info.firstName);
        setMiddleName(info.middleName);
        setType(info.kind);
      }
    } catch (error) {

    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await AccountService.updateAccount(account.accountID, {
        currentPassword, newPassword, retypePassword,
        photo: imageFile
      });
      pushNotification({
        title: 'Success',
        message: 'Profile updated.'
      });
      setTime(Date.now());
    } catch (error) {
      pushNotification({
        title: 'Error',
        message: error.message,
        delay: 0
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImage = e => {
    const file = e.currentTarget.files[0];
    setImageFile(file);
    if (file) {
      const fr = new FileReader();
      fr.onload = () => {
        setImage(fr.result);
      }
      fr.readAsDataURL(file);
    }
  };

  useEffect(() => {
    load();
  }, [account]);

  return (
    <>
      <Form onSubmit={handleSave}>
        <Row>
          <Col>
            <h3>Account settings</h3>
          </Col>
          <Col className='d-flex flex-column align-items-end'>
            <div className='d-flex flex-row align-items-center'>
              { saving && <Spinner className='me-2' /> }
              <Button type='submit' className='ms-auto d-inline' disabled={saving}>Save</Button>
            </div>
          </Col>
        </Row>
        <Row className='mt-2'>
          <Col md={8}>
            <Row>
              <Col>
                <h4>Profile</h4>
                <p className='text-muted'>
                  Fields grayed out cannot be changed from this screen and can only be changed by
                  an administrator.
                </p>
              </Col>
            </Row>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="text" value={email} readOnly disabled />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formType">
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={type} disabled>
                    <option value=''>--- Select type ---</option>
                    <option value='student'>Student</option>
                    <option value='faculty'>Faculty</option>
                    <option value='administrator'>Administrator</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formLastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control type="text" value={lastName} readOnly disabled />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formFirstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control type="text" value={firstName} readOnly disabled />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formMiddleName">
                  <Form.Label>Middle Name</Form.Label>
                  <Form.Control type="text" value={middleName} readOnly disabled />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col>
                <h4>Password</h4>
              </Col>
            </Row>
            {
              !showChangePassword && <>
                <Row>
                  <Col>
                    <Button onClick={() => setShowChangePassword(true)}>Change password</Button>
                  </Col>
                </Row>
              </>
            }
            {
              showChangePassword && <>
                <Row>
                  <Col>
                    <Button onClick={() => setShowChangePassword(false)}>Cancel</Button>
                  </Col>
                </Row>
                <Row>
                  <PasswordField value={currentPassword} onChange={value => setCurrentPassword(value)}>
                    <Col md={8}>
                      <Form.Group className="mb-3" controlId="formCurrentPassword">
                        <Form.Label>Current password</Form.Label>
                        <PasswordText />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Label>&nbsp;</Form.Label>
                      <PasswordToggler className='mt-2' />
                    </Col>
                  </PasswordField>
                </Row>
                <Row>
                  <PasswordField value={newPassword} onChange={value => setNewPassword(value)}>
                    <Col md={8}>
                      <Form.Group className="mb-3" controlId="formNewPassword">
                        <Form.Label>New password</Form.Label>
                        <PasswordText />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Label>&nbsp;</Form.Label>
                      <PasswordToggler className='mt-2' />
                    </Col>
                  </PasswordField>
                </Row>
                <Row>
                  <PasswordField value={retypePassword} onChange={value => setRetypePassword(value)}>
                    <Col md={8}>
                      <Form.Group className="mb-3" controlId="formRetypePassword">
                        <Form.Label>Retype password</Form.Label>
                        <PasswordText />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Label>&nbsp;</Form.Label>
                      <PasswordToggler className='mt-2' />
                    </Col>
                  </PasswordField>
                </Row>
              </>
            }
            <Row>
              <Col>
                <h4>Schedule</h4>
              </Col>
            </Row>
          </Col>
          <Col md={4} className='d-flex flex-column align-items-end'>
            <ProfileImage
              style={{ cursor: 'pointer' }}
              width='288px'
              rounded
              src={image}
              accountID={account.accountID}
              version={time}
              onClick={() => {imageRef.current.click()}}
            />
            { image && <small className='text-muted'></small> }
            <small className='text-muted'>Profile photo must be square.</small>
            <input hidden type='file' onChange={handleImage} ref={imageRef} accept='image/jpeg,image/png' />
            <Button variant='secondary' className='mt-2' onClick={() => {imageRef.current.click()}}>Change photo...</Button>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default SettingsPage;
