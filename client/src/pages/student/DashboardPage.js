import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import AccountService from '../../services/AccountService';
import ThesisService from '../../services/ThesisService';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

function DashboardPage() {
  const [theses, setTheses] = useState([]);
  /*const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authors, setAuthors] = useState([]);
  const [advisers, setAdvisers] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState('');
  const [show, setShow] = useState(false);*/

  const onLoad = async () => {
    setTheses(await ThesisService.getTheses({ getSubmissions: true }));
    /*setStudents(await AccountService.getStudents());
    setFaculty(await AccountService.getFaculty());*/
  };

  /*const handleClose = () => setShow(false);

  const handleAddStudent = () => {
    setAuthors(prev => {
      const value = students.find(e => e._id === selectedStudent);
      return [ ...prev, value ];
    });
    setSelectedStudent('');
  };

  const handleRemoveStudent = (id) => {
    setAuthors(prev => prev.filter(e => e._id !== id));
  };

  const handleAddFaculty = () => {
    setAdvisers(prev => {
      const value = faculty.find(e => e._id === selectedFaculty);
      return [ ...prev, value ];
    });
    setSelectedFaculty('');
  };

  const handleRemoveFaculty = (id) => {
    setAdvisers(prev => prev.filter(e => e._id !== id));
  };

  const handleAttachFile = (e) => {
    const file = e.currentTarget.files[0];
    setAttachments(prev => [ ...prev, file ]);
    setFile('');
  };

  const handleRemoveAttachment = (e) => {
    setAttachments(prev => prev.filter(e2 => e2 !== e));
  };

  const handleSubmit = async () => {
    try {
      await ThesisService.createThesis({
        title,
        description,
        authors,
        advisers,
        attachments
      });
      setShow(false);
    } catch (error) {

    }
  };*/

  const findMember = (thesis, submitterID, mode) => {
    let table;
    switch (mode) {
      case 'adviser': table = thesis.advisers; break;
      default: table = thesis.authors; break;
    }

    return table.find(e => e._id === submitterID);
  };

  const renderName = (person) => `${person.lastName}, ${person.firstName}`

  useEffect(() => {
    onLoad();
  }, []);

  return (
    <>
      <h3>My thesis</h3>
      <>
        {
          (theses && theses[0]) ?
            <>
              {theses[0].title}
              {
                (theses[0].submissions && theses[0].submissions.length > 0) ?
                  <>
                    <h5>Submissions</h5>
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Submitter</th>
                          <th>Submitted</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          theses[0].submissions.map((e, i) => (
                            <tr>
                              <td><Link to={`/thesis/${theses[0]._id}/submission/${e._id}`}>{theses[0].submissions.length - i}</Link></td>
                              <td><Link to={`/thesis/${theses[0]._id}/submission/${e._id}`}>{renderName(findMember(theses[0], e.submitter))}</Link></td>
                              <td><Link to={`/thesis/${theses[0]._id}/submission/${e._id}`}>{dayjs(e.submitted).format('LLL')}</Link></td>
                              <td>For checking</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </Table>
                  </> : <p>Your group has not made any submissions.</p>
              }
            </> :
            <p>You or your group have not uploaded your thesis yet.</p>
        }
      </>
      { !(theses && theses[0]) && <LinkContainer to='/thesis/new'><Button color='primary'>Create thesis</Button></LinkContainer> }
      {/*<Modal size='lg' show={show} onHide={handleClose} centered animation={false} scrollable>
        <Modal.Header closeButton>
          <Modal.Title>Create thesis</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control type="text" value={title} onChange={e => setTitle(e.currentTarget.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control as='textarea' type="text" value={description} onChange={e => setDescription(e.currentTarget.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Attachments</Form.Label>
              <Form.Control type="file" value={file} onChange={handleAttachFile} />
            </Form.Group>
            {
              attachments.length > 0 &&
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Filename</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      attachments.map(e => (
                        <tr>
                          <td>{e.name}</td>
                          <td><Button as='a' variant='link' style={{ padding: 0 }} onClick={() => handleRemoveAttachment(e)}>Remove</Button></td>
                        </tr>
                      ))
                    }
                  </tbody>
                </Table>
            }
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Authors</Form.Label>
              <Row className="align-items-center">
                <Col xs={9} sm={10} className="my-1">
                  <Form.Select aria-label="Default select example" value={selectedStudent} onChange={(e) => setSelectedStudent(e.currentTarget.value)}>
                    <option>--- Select student ---</option>
                    {
                      students && students.filter(e => !authors.includes(e)).map(e => (
                        <option value={e._id}>{e.lastName}, {e.firstName}</option>
                      ))
                    }
                  </Form.Select>
                </Col>
                <Col xs={3} sm={2} className="my-1">
                  <Button className='w-100' onClick={handleAddStudent} disabled={authors.length >= 4}>Add</Button>
                </Col>
              </Row>
            </Form.Group>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Last Name</th>
                  <th>First Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  authors.length > 0 ? authors.map(e => (
                    <tr>
                      <td>{e.lastName}</td>
                      <td>{e.firstName}</td>
                      <td><Button as='a' variant='link' style={{ padding: 0 }} onClick={() => handleRemoveStudent(e._id)}>Remove</Button></td>
                    </tr>
                  )) : <tr><td className='text-center' colSpan={3}>No authors added.</td></tr>
                }
              </tbody>
            </Table>
            <Form.Group className="mb-3" controlId="formDescription">
              <Form.Label>Advisers</Form.Label>
              <Row className="align-items-center">
                <Col xs={9} sm={10} className="my-1">
                  <Form.Select aria-label="Default select example" value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.currentTarget.value)}>
                    <option>--- Select adviser ---</option>
                    {
                      faculty && faculty.filter(e => !advisers.includes(e)).map(e => (
                        <option value={e._id}>{e.lastName}, {e.firstName}</option>
                      ))
                    }
                  </Form.Select>
                </Col>
                <Col xs={3} sm={2} className="my-1">
                  <Button className='w-100' onClick={handleAddFaculty} disabled={advisers.length >= 2}>Add</Button>
                </Col>
              </Row>
            </Form.Group>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Last Name</th>
                  <th>First Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  advisers.length > 0 ? advisers.map(e => (
                    <tr>
                      <td>{e.lastName}</td>
                      <td>{e.firstName}</td>
                      <td><Button as='a' variant='link' style={{ padding: 0 }} onClick={() => handleRemoveFaculty(e._id)}>Remove</Button></td>
                    </tr>
                  )) : <tr><td className='text-center' colSpan={3}>No advisers added.</td></tr>
                }
              </tbody>
            </Table>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create
          </Button>
        </Modal.Footer>
      </Modal>*/}
    </>
  );
}

export default DashboardPage;
