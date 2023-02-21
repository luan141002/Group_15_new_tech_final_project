import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import { Link, useNavigate } from 'react-router-dom';
import { useAccount } from '../../providers/account';
import AuthService from '../../services/AuthService';

function LoginPage() {
  const { setAccount } = useAccount();
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    const { data } = await AuthService.login(userID, password);
    setAccount({
      accountID: data.accountID,
      userID: data.userID,
      roles: [],
      kind: data.kind.toLowerCase(),
    });
    navigate('/');
  };

  return (
    <Card style={{ width: '30rem' }}>
      <Card.Body>
        <Form onSubmit={handleLogin}>
          <h1 className='display-5'>Sign in</h1>
          <Form.Group className='mb-3' controlId='formUserID'>
            <Form.Label>User ID</Form.Label>
            <Form.Control type='text' value={userID} onChange={e => setUserID(e.target.value)} />
          </Form.Group>
          <Form.Group className='mb-3' controlId='formPassword'>
            <Form.Label>Password</Form.Label>
            <Form.Control type='password' value={password} onChange={e => setPassword(e.target.value)} />
          </Form.Group>
          { error && <Alert color='danger'>{error}</Alert> }
          <p>No account? <Link to='/auth/register'>Register here</Link>.</p>
          <Button variant='primary' type='submit'>Sign in</Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default LoginPage;
