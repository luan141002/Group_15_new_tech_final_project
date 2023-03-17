import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { Trash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAccount } from '../providers/account';
import AnnouncementService from '../services/AnnouncementService';

function AnnouncementsPage() {
  const { t } = useTranslation();
  const { account } = useAccount();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState({});
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [deleteID, setDeleteID] = useState('');
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const load = async () => {
    await loadPage(1);
  };

  const loadPage = async (page) => {
    setAnnouncements(await AnnouncementService.getAnnouncements({ all: true, items: itemsPerPage, page }));
  }

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setSaving(true);
      await AnnouncementService.createAnnouncement({ title, text });
      await load();
      setAnnouncementDialog(false);
    } catch (error) {
      setError(error.code ? t(error.code) : error.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAnnouncement = async e => {
    e.preventDefault();
    try {
      setError('');
      setSaving(true);
      await AnnouncementService.deleteAnnouncement(deleteID);
      await load();
      setDeleteID('');
    } catch (error) {
      setError(error.code ? t(error.code) : error.message);
    } finally {
      setSaving(false);
    }
  };

  const tryDeleteAnnouncement = id => {
    setDeleteID(id);
  };

  const handleCancel = () => {
    setTitle('');
    setText('');
    setError('');
    setAnnouncementDialog(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Row className='mb-4'>
        <Col className='d-flex flex-row align-items-middle'>
          <h3>Announcements</h3>
        </Col>
        <Col className='d-flex flex-column align-items-end'>
          <div className='d-flex flex-row align-items-center'>
            {
              account.kind === 'administrator' &&
                <Button className='ms-2' onClick={() => setAnnouncementDialog(true)}>
                  Create announcement
                </Button>
            }
            <Button variant='secondary' className='ms-2' onClick={() => navigate(-1)}>Back</Button>
          </div>
        </Col>
      </Row>
      {
        announcements.items && announcements.items.length > 0 ?
          announcements.items.map(e => (
            <Card className='mb-4'>
              <Card.Body>
                <Card.Title>
                  <Row>
                    <Col className='d-flex flex-row align-items-middle'>
                      <span>{e.title}</span>
                    </Col>
                    <Col className='d-flex flex-column align-items-end'>
                      <div className='d-flex flex-row align-items-center'>
                        {
                          account.kind === 'administrator' &&
                            <Button className='p-0' variant='light' onClick={() => tryDeleteAnnouncement(e._id)}>
                              <Trash />
                            </Button>
                        }
                      </div>
                    </Col>
                  </Row>
                </Card.Title>
                <Card.Subtitle className='text-muted'>
                  {dayjs(e.sent).format('LLL')}
                </Card.Subtitle>
                <Card.Text>
                  {e.text}
                </Card.Text>
              </Card.Body>
            </Card>
          ))
          :
          <p>There are no announcements.</p>
      }
      {
        account.kind === 'administrator' &&
          <Modal show={announcementDialog} animation={false} centered size='lg'>
            <Modal.Header>
              <Modal.Title>
                Create announcement
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                { error && <Alert variant='danger'>{error}</Alert> }
                <Form.Group className="mb-3" controlId="formTitle">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type='text'
                    value={title}
                    onChange={e => setTitle(e.currentTarget.value)}
                    disabled={saving}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBody">
                  <Form.Label>Body</Form.Label>
                  <Form.Control
                    as='textarea'
                    rows={10}
                    value={text}
                    onChange={e => setText(e.currentTarget.value)}
                    disabled={saving}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button type='submit' disabled={saving}>Continue</Button>
                <Button variant='secondary' onClick={handleCancel} disabled={saving}>Cancel</Button>
              </Modal.Footer>
            </Form>
          </Modal>
      }
      {
        account.kind === 'administrator' &&
          <Modal show={!!deleteID} animation={false} centered size='lg'>
            <Modal.Header>
              <Modal.Title>
                Delete announcement
              </Modal.Title>
            </Modal.Header>
            <Form onSubmit={deleteAnnouncement}>
              <Modal.Body>
                { error && <Alert variant='danger'>{error}</Alert> }
                Once deleted, it cannot be undone.
              </Modal.Body>
              <Modal.Footer>
                <Button type='submit' disabled={saving}>Delete</Button>
                <Button variant='secondary' onClick={() => { setError(''); setDeleteID(''); }} disabled={saving}>Cancel</Button>
              </Modal.Footer>
            </Form>
          </Modal>
      }
    </>
  )
}

export default AnnouncementsPage;
