import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import AccountService from '../services/AccountService';
import { useEffect, useState } from "react";
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { useAccount } from '../providers/account';
import renderName from '../utility/renderName';

function ThesisEditor(props) {
  const { account } = useAccount();
  const { thesis, onSubmit } = props;
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authors, setAuthors] = useState([]);
  const [advisers, setAdvisers] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [file, setFile] = useState('');

  const onLoad = async () => {
    if (thesis) {
      setTitle(thesis.title);
      setDescription(thesis.description);
      setAuthors(thesis.authors);
      setAdvisers(thesis.advisers);
    }
  };

  const handleSearchStudents = async (q) => {
    setStudentsLoading(true);
    const students = await AccountService.getStudents({ q });
    setStudents(students);
    setStudentsLoading(false);
  };

  const handleAddStudent = () => {
    setAuthors(prev => {
      const value = students.find(e => e._id === selectedStudent[0]._id);
      return [ ...prev, value ];
    });
    setSelectedStudent([]);
  };

  const handleRemoveStudent = (id) => {
    setAuthors(prev => prev.filter(e => e._id !== id));
  };

  const handleSearchFaculty = async (q) => {
    setFacultyLoading(true);
    const faculty = await AccountService.getFaculty({ q });
    setFaculty(faculty);
    setFacultyLoading(false);
  };

  const handleAddFaculty = () => {
    setAdvisers(prev => {
      const value = faculty.find(e => e._id === selectedFaculty[0]._id);
      return [ ...prev, value ];
    });
    setSelectedFaculty([]);
  };

  const handleRemoveFaculty = (id) => {
    setAdvisers(prev => prev.filter(e => e._id !== id));
  };

  const handleAddAttachment = (e) => {
    const file = e.currentTarget.files[0];
    setAttachments(prev => [ ...prev, file ]);
    setFile('');
  };

  const handleRemoveAttachment = (e) => {
    setAttachments(prev => prev.filter(e2 => e2 !== e));
  };

  const handleSubmit = async () => {
    if (onSubmit) {
      onSubmit({
        title,
        description,
        authors,
        advisers,
        attachments
      });
    }
  };

  useEffect(() => {
    onLoad();
  }, [thesis]);

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col>
            <h3>{ thesis ? 'Edit' : 'Add' } thesis</h3>
          </Col>
          <Col className='d-flex flex-column align-items-end'>
            <Button type='submit' className='ms-auto'>Save</Button>
          </Col>
        </Row>
        <Form.Group className="mb-3" controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control type="text" value={title} onChange={e => setTitle(e.currentTarget.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control as='textarea' type="text" value={description} onChange={e => setDescription(e.currentTarget.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formDocument">
          <Form.Label>Documents</Form.Label>
          <Form.Control type="file" value={file} onChange={handleAddAttachment} />
        </Form.Group>
        {
          (account.kind === 'student') && (attachments.length > 0 &&
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
            </Table>)
        }
        {
          (account.kind !== 'student') && (
            <Form.Group className="mb-3" controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select>
                <option value='for_checking'>For checking</option>
                <option value='approved'>Approved</option>
              </Form.Select>
            </Form.Group>
          )
        }
        <Form.Group className="mb-3" controlId="formAuthor">
          <Form.Label>Authors</Form.Label>
          <Row className="align-items-center">
            <Col xs={9} sm={10} className="my-1">
              <AsyncTypeahead
                id='formStudent'
                filterBy={(student) => !authors.includes(student._id)}
                isLoading={studentsLoading}
                labelKey={(option) => renderName(option)}
                minLength={2}
                onSearch={handleSearchStudents}
                options={students}
                onChange={setSelectedStudent}
                selected={selectedStudent}
                placeholder='Search from students...'
              />
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
        <Form.Group className="mb-3" controlId="formAdviser">
          <Form.Label>Advisers</Form.Label>
          <Row className="align-items-center">
            <Col xs={9} sm={10} className="my-1">
              <AsyncTypeahead
                id='formFaculty'
                filterBy={(faculty) => !advisers.includes(faculty._id)}
                isLoading={facultyLoading}
                labelKey={(option) => renderName(option)}
                minLength={2}
                onSearch={handleSearchFaculty}
                options={faculty}
                onChange={setSelectedFaculty}
                selected={selectedFaculty}
                placeholder='Search from faculty...'
              />
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
        <Button type='submit'>Save</Button>
      </Form>
    </>
  );
}

export default ThesisEditor;
