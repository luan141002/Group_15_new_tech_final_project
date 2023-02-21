import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import AccountService from '../../services/AccountService';
import defaultProfile from '../../default-profile-photo.jpg';

function AccountPage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [email, setEmail] = useState('');
  const [idNumber, setIDNumber] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [type, setType] = useState('');
  const [saving, setSaving] = useState(false);
  /* const [image, setImage] = useState(null);
  const imageRef = useRef(); */

  const isNew = !aid;

  useEffect(() => {
    if (account) {
      setIDNumber(account.idnum);
      setEmail(account.email);
      setLastName(account.lastName);
      setFirstName(account.firstName);
      setMiddleName(account.middleName);
      setType(account.kind);
    }
  }, [account]);

  const load = async () => {
    if (aid) {
      setAccount(await AccountService.getAccount(aid));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!aid) {
      try {
        setSaving(true);
        const account = await AccountService.createAccount({ idnum: idNumber, lastName, firstName, middleName, kind: type });
        navigate(`/account/${account._id}`);
      } catch (error) {
        
      } finally {
        setSaving(false);
      }
    }
  };
  
  /* const handleImage = (event) => {

  }; */

  useEffect(() => {
    load();
  }, [])

  return (
    <>
      {/*<Card style={{ width: '18rem' }}>
        <Card.Body>
          <Nav variant="pills" defaultActiveKey="general" className="flex-column">
            <Nav.Link eventKey="general">General</Nav.Link>
          </Nav>
        </Card.Body>
      </Card>*/}
      <Form onSubmit={handleSave}>
        <Row>
          <Col>
            <h3>{ isNew ? 'Add new' : 'Edit' } account</h3>
          </Col>
          <Col className='d-flex flex-column align-items-end'>
            <div className='d-flex flex-row align-items-center'>
              { saving && <Spinner className='me-2' /> }
              <Button type='submit' className='ms-auto d-inline' disabled={saving}>Save</Button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col md={isNew ? 12 : 8}>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formIDNumber">
                  <Form.Label>ID number</Form.Label>
                  <Form.Control type="text" value={idNumber} onChange={e => setIDNumber(e.currentTarget.value)} readOnly={!isNew} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="text" value={email} onChange={e => setEmail(e.currentTarget.value)} readOnly={!isNew} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formType">
                  <Form.Label>Type</Form.Label>
                  <Form.Select value={type} onChange={e => setType(e.currentTarget.value)} disabled={!isNew}>
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
                  <Form.Control type="text" value={lastName} onChange={e => setLastName(e.currentTarget.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formFirstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control type="text" value={firstName} onChange={e => setFirstName(e.currentTarget.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3" controlId="formMiddleName">
                  <Form.Label>Middle Name</Form.Label>
                  <Form.Control type="text" value={middleName} onChange={e => setMiddleName(e.currentTarget.value)} />
                </Form.Group>
              </Col>
            </Row>
          </Col>
          {
            !isNew && (
              <Col md={4} className='d-flex flex-column align-items-end'>
                <Image width='288px' rounded src={/* image || */ defaultProfile} /*  onClick={() => {imageRef.current.click()}} */ />
                {/* <input hidden type='file' onChange={handleImage} ref={imageRef} />
                <Button variant='secondary' className='mt-2' onClick={() => {imageRef.current.click()}}>Change photo...</Button> */}
              </Col>
            )
          }
        </Row>
        <Row>
        </Row>
      </Form>
    </>
  );
}

export default AccountPage;
