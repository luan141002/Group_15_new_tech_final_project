import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AccountService from '../../services/AccountService';
import renderName from '../../utility/renderName';
import { Pencil } from 'react-bootstrap-icons';
import { LinkContainer } from 'react-router-bootstrap';

function DashboardPage() {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const load = async () => {
    setStudents(await AccountService.getStudents());
    setFaculty(await AccountService.getFaculty());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Row>
        <Col>
          <h3>Account</h3>
          <h5>Students</h5>
        </Col>
        <Col className='d-flex flex-column align-items-end'>
          <LinkContainer to='/account/new'><Button as='a'>Add account</Button></LinkContainer>
        </Col>
      </Row>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>ID number</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {
            students.map(e => (
              <tr>
                <td>{e.idnum}</td>
                <td>{renderName(e)}</td>
                <td>
                  <LinkContainer to={`/account/${e._id}`}>
                    <Button variant='link' size='sm'><Pencil /></Button>
                  </LinkContainer>
                </td>
              </tr>
            ))
          }
        </tbody>
      </Table>
      <h5>Faculty</h5>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>ID number</th>
            <th>Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {
            faculty.map(e => (
              <tr>
                <td>{e.idnum}</td>
                <td>{renderName(e)}</td>
                <td>
                  <LinkContainer to='/'>
                    <Button variant='link' size='sm'><Pencil /></Button>
                  </LinkContainer>
                </td>
              </tr>
            ))
          }
        </tbody>
      </Table>
    </>
  );
}

export default DashboardPage;
