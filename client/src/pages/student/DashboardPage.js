import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import { X } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import ProfileImage from '../../components/ProfileImage';
import AnnouncementService from '../../services/AnnouncementService';
import ThesisService from '../../services/ThesisService';

function DashboardPage() {
  const { t } = useTranslation();
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  const onLoad = async () => {
    try {
      setLoading(true);
      setAnnouncements(await AnnouncementService.getAnnouncements());
      setTheses(await ThesisService.getTheses({ getSubmissions: true }));
    } finally {
      setLoading(false);
    }
  };

  const dismissAnnouncement = id => {
    setAnnouncements(prev => prev.filter(e => e._id !== id));
  };

  const findMember = (thesis, submitterID, mode) => {
    let table;
    switch (mode) {
      case 'adviser': table = thesis.advisers; break;
      default: table = thesis.authors; break;
    }

    return table.find(e => e._id === submitterID);
  };

  useEffect(() => {
    onLoad();
  }, []);

  return (
    <>
      {
        !loading && !(theses && theses[0]) &&
          <Alert variant='warning'>
            <Row>
              <Col className='d-flex flex-row align-items-middle'>
                <p className='my-auto'>You or your group has not uploaded your thesis yet.</p>
              </Col>
              <Col className='d-flex flex-row align-items-end'>
                <LinkContainer to='/thesis/new'>
                  <Button color='primary' className='ms-auto'>Add thesis</Button>
                </LinkContainer>
              </Col>
            </Row>
          </Alert>
      }
      {
        !loading && (theses && theses[0] && theses[0].status === 'endorsed') &&
          <Alert>
            <Row>
              <Col className='d-flex flex-row align-items-middle'>
                <p className='my-auto'>You can now request a schedule for your defense.</p>
              </Col>
              <Col className='d-flex flex-row align-items-end'>
                <LinkContainer to='/defense/request'>
                  <Button color='primary' className='ms-auto'>Request a defense schedule</Button>
                </LinkContainer>
              </Col>
            </Row>
          </Alert>
      }
      <Row>
        <Col sm={8} md={9}>
          {
            announcements.length > 0 &&
              <Card className='mb-4'>
                <Card.Body>
                  <Card.Title>Announcements</Card.Title>
                  <Card.Text>
                    {
                      announcements.map(e => (
                        <>
                          <hr />
                          <div className='clearfix'>
                            <h4 className='float-start'>{e.title}</h4>
                            <Button variant='light' className='float-end' onClick={() => dismissAnnouncement(e._id)}>
                              <span style={{ verticalAlign: 'super' }}><X /></span>
                            </Button>
                          </div>
                          <h6 className='text-muted'>{dayjs(e.sent).format('LLL')}</h6>
                          <p>{e.text}</p>
                        </>
                      ))
                    }
                  </Card.Text>
                </Card.Body>
              </Card>
          }
          <Card className='mb-4'>
            <Card.Body>
              <Card.Title>Submissions</Card.Title>
              <Card.Text>
                {
                  theses && theses[0] && (
                    (theses[0].submissions && theses[0].submissions.length > 0) ?
                      <>
                        <Table striped bordered hover size="sm">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Submitter</th>
                              <th>Submitted</th>
                            </tr>
                          </thead>
                          <tbody>
                            {
                              theses[0].submissions.map((e, i) => (
                                <tr>
                                  <td><Link to={`/thesis/${theses[0]._id}/submission/${e._id}`}>{theses[0].submissions.length - i}</Link></td>
                                  <td><Link to={`/thesis/${theses[0]._id}/submission/${e._id}`}>{t('values.full_name', findMember(theses[0], e.submitter))}</Link></td>
                                  <td><Link to={`/thesis/${theses[0]._id}/submission/${e._id}`}>{dayjs(e.submitted).format('LLL')}</Link></td>
                                </tr>
                              ))
                            }
                          </tbody>
                        </Table>
                      </>
                      :
                      <>
                        <p>Your group has not made any submissions.</p>
                        <LinkContainer to={`/thesis/${theses[0]._id}`}>
                          <Button>Go to thesis page</Button>
                        </LinkContainer>
                      </>
                  )
                }
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={4} md={3}>
          <Card>
            <Card.Body>
              <Card.Title>My thesis</Card.Title>
              <Card.Text>
                {
                  (theses && theses[0]) ?
                    <>
                      <p>{theses[0].title}</p>
                      <h6>Members</h6>
                      <div className='mb-1'>
                        {
                          theses[0].authors.map(e => (
                            <ProfileImage
                              width={30}
                              accountID={e._id}
                              roundedCircle
                              className='me-1'
                              alt={t('values.full_name', e)}
                              title={t('values.full_name', e)}
                            />
                          ))
                        }
                      </div>
                      <h6>Adviser</h6>
                      <div className='mb-1'>
                        {
                          theses[0].advisers.map(e => (
                            <ProfileImage
                              width={30}
                              accountID={e._id}
                              roundedCircle
                              className='me-1'
                              alt={t('values.full_name', e)}
                              title={t('values.full_name', e)}
                            />
                          ))
                        }
                      </div>
                      <h6>Status</h6>
                      <p>{t(`values.thesis_status.${theses[0].status}`)}</p>
                      <LinkContainer to={`/thesis/${theses[0]._id}`}>
                        <Button>View</Button>
                      </LinkContainer>
                    </> :
                    <>
                      <p className='text-muted'>None</p>
                    </>
                }
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default DashboardPage;
