import { useEffect, useState } from 'react';
import ThesisTable from '../components/ThesisTable';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useAccount } from '../providers/account';
import { LinkContainer } from 'react-router-bootstrap';

function ThesesPage() {
  const { account } = useAccount();
  const [all, setAll] = useState(false);

  useEffect(() => {
    setAll(account.kind === 'administrator');
  }, [account]);

  return (
    <>
      <Row className='mb-3'>
        <Col>
          <h3>Thesis Projects</h3>
        </Col>
        <Col className='d-flex flex-column align-items-end'>
          <div className='d-flex flex-row align-items-center'>
            {
              account && account.kind === 'administrator' &&
                <LinkContainer to='/thesis/new'>
                  <Button className='ms-auto d-inline w-100'>Add Thesis Project</Button>
                </LinkContainer>
            }
          </div>
        </Col>
      </Row>
      <ThesisTable
        userKind={account.kind}
        filter
        pagination
      />
    </>
  )
}

export default ThesesPage;
