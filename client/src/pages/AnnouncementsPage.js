import { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { Pencil, Trash } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAccount } from '../providers/account';
import AnnouncementService from '../services/AnnouncementService';
import Paginator from '../components/Paginator';

async function loadAnnouncements(pageNumber = 1, itemsPerPage = 5) {
  return await AnnouncementService.getAnnouncements({ all: true, items: itemsPerPage, page: pageNumber });
}

function AnnouncementsPage() {
  const { account } = useAccount();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Announcement list and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [announcements, setAnnouncements] = useState(() => {
    loadAnnouncements().then(result => {
      setAnnouncements(result.items);
      setTotalPages(result.totalPages);
    });
  });

  // Modal state
  const [announcementDialog, setAnnouncementDialog] = useState(false);
  const [updateID, setUpdateID] = useState('');
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [deleteID, setDeleteID] = useState('');

  const load = async () => {
    const results = await loadAnnouncements(currentPage, itemsPerPage);
    setAnnouncements(results.items);
    setTotalPages(results.totalPages);
  };

  useEffect(() => {
    load();
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    load();
  }, [itemsPerPage]);

  const handlePage = async newPage => {
    setCurrentPage(newPage);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      setSaving(true);
      if (updateID) {
        await AnnouncementService.updateAnnouncement(updateID, { title, text });
      } else {
        await AnnouncementService.createAnnouncement({ title, text });
      }
      setCurrentPage(1);
      await load();
      closeDialog();
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
      setCurrentPage(1);
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

  const openCreateDialog = () => {
    setUpdateID('');
    setTitle('');
    setText('');
    setError('');
    setAnnouncementDialog(true);
  };

  const openUpdateDialog = (e) => {
    setUpdateID(e._id);
    setTitle(e.title);
    setText(e.text);
    setError('');
    setAnnouncementDialog(true);
  };

  const closeDialog = () => {
    setUpdateID('');
    setTitle('');
    setText('');
    setError('');
    setAnnouncementDialog(false);
  };

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
                <Button className='ms-2' onClick={openCreateDialog}>
                  Create announcement
                </Button>
            }
            <Button variant='secondary' className='ms-2' onClick={() => navigate(-1)}>Back</Button>
          </div>
        </Col>
      </Row>
      {
        announcements && announcements.length > 0 ?
          announcements.map(e => (
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
                            <>
                              <Button className='p-0' variant='light' onClick={() => openUpdateDialog(e)}>
                                <Pencil />
                              </Button>
                              <Button className='p-0' variant='light' onClick={() => tryDeleteAnnouncement(e._id)}>
                                <Trash />
                              </Button>
                            </>
                        }
                      </div>
                    </Col>
                  </Row>
                </Card.Title>
                <Card.Subtitle className='text-muted'>
                  {dayjs(e.sent).format('LLL')}
                </Card.Subtitle>
                <Card.Text>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {e.text}
                  </div>
                </Card.Text>
              </Card.Body>
            </Card>
          ))
          :
          <p>There are no announcements.</p>
      }
      {
        announcements && announcements.length > 0 && (
          <>
            <Paginator page={currentPage} pageCount={totalPages} onChange={handlePage} />
          </>
        )
      }
      {
        account.kind === 'administrator' &&
          <Modal show={announcementDialog} animation={false} centered size='lg'>
            <Modal.Header>
              <Modal.Title>
                { updateID ? 'Edit' : 'Create' } announcement
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
                <Button variant='secondary' onClick={closeDialog} disabled={saving}>Cancel</Button>
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
