import { useEffect, useRef, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayjs from 'dayjs';
import DefenseService from '../services/DefenseService';
import { useAccount } from '../providers/account';
import ThesisService from '../services/ThesisService';
import ThesisSelector from '../components/ThesisSelector';

function DefenseWeekPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { account } = useAccount();
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [slotInterval, setSlotInterval] = useState(30 * 60 * 1000);
  const [defenses, setDefenses] = useState([]);
  const calendarRef = useRef(null);
  const [thesis, setThesis] = useState(null);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [endorseNotice, setEndorseNotice] = useState(true);

  const [dialogValidated, setDialogValidated] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [addEventsDialog, setAddEventsDialog] = useState(false);
  const [eventThesis, setEventThesis] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState(''); // TODO: integrate description
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventDate, setEventDate] = useState('');

  const [adviserEvent, setAdviserEvent] = useState(null);
  const [adminEvent, setAdminEvent] = useState(null);

  const functions = {
    isAuthor: (thesis) => {
      return thesis.authors.find(e => e._id === account.accountID);
    },

    isAdvisory: (thesis) => {
      return thesis.advisers.find(e => e._id === account.accountID);
    },

    tryAddDefense: (start, end, title, thesis) => {
      setDefenses(prev => {
        const next = [ ...prev ];
        next.push({
          _id: start.getTime().toString(),
          start,
          end,
          title,
          thesis,
          action: 'create'
        });
        return next;
      });
    },

    tryRemoveDefense: id => {
      setDefenses(prev => {
        const defenseI = prev.findIndex(e => e._id === id);
        if (defenseI === -1) return prev;

        const defense = { ...prev[defenseI] };
        if (defense.action === 'create') {
          return prev.filter((_, i) => i !== defenseI);
        } else {
          defense.action = 'delete';
          const next = [ ...prev ];
          next[defenseI] = defense;
          return next;
        }
      });
    },

    hasTentativeChanges: () => {
      return defenses.some(e => !!e.action);
    },

    getAllTentativeChanges: () => {
      return defenses.filter(e => !!e.action).map(e => e.action === 'create' ? e : { _id: e._id, action: e.action });
    },
    
    getThesesWithActiveRequests: () => {
      const activeRequests = defenses.filter(e => e.status === 'pending' || e.status === 'approved');
      const theses = activeRequests.map(e => e.thesis);
      const uniqueIDs = theses.reduce((p, e) => ({ ...p, [e._id]: e }), {});
      const activeTheses = [];
      for (const [key, value] of Object.entries(uniqueIDs)) {
        activeTheses.push(value);
      }

      activeTheses.sort((a, b) => a.title.localeCompare(b.title));
      return activeTheses;
    },

    getOwnRequests: () => {
      if (!thesis) return [];
      return defenses.filter(e => e.thesis._id === thesis._id);
    },

    tryUpdateDefense: (id, action) => {
      setDefenses(prev => {
        const defenseI = prev.findIndex(e => e._id === id);
        if (defenseI === -1) return prev;

        const defense = { ...prev[defenseI] };
        defense.action = action;
        console.log(defense);
        const next = [ ...prev ];
        next[defenseI] = defense;
        return next;
      });
    },

    tryChangeStatus: (id, newStatus) => {
      setDefenses(prev => {
        const defenseI = prev.findIndex(e => e._id === id);
        if (defenseI === -1) return prev;

        const defense = { ...prev[defenseI] };
        defense.status = newStatus;
        const next = [ ...prev ];
        next[defenseI] = defense;
        return next;
      });
    },

    revertAllActions: () => {
      setDefenses(prev => prev.filter(e => e.action !== 'create').map(e => {
        const { action, ...rest } = e;
        return rest;
      }));
    },

    applyAllActions: (allActions) => {
      setDefenses(prev => {
        const next = prev.filter(e => e.action !== 'delete');
        return next.map(e => {
          let action = '';
          if (allActions) {
            const actionItem = allActions.find(e2 => e2._id === e._id);
            if (actionItem) action = actionItem.action;
          }

          const { ...copy } = e;
          if (!action) action = e.action;

          switch (action) {
            case 'approve': copy.status = 'approved'; break;
            case 'decline': copy.status = 'declined'; break;
            case 'confirm': copy.status = 'confirmed'; break;
            case 'create': copy.status = account.kind === 'administrator' ? 'confirmed' : 'pending'; break;
            default: break;
          }
          return copy;
        });
      });
    },

    selectThesis: thesis => {

    },

    getEvent: id => {
      return defenses.find(e => e._id === id);
    },

    getEvents: () => {
      const filter = e => {
        if (account.kind === 'student') {
          return true;
        } else if (account.kind === 'faculty') {
          return true;
        } else if (account.kind === 'administrator') {
          return e.status !== 'pending';
        } else {
          return true;
        }
      };

      return defenses.filter(filter).map(e => {
        let className = '';
        
        switch (e.status) {
          case 'approved':
          case 'pending': className = 'bg-warning'; break;
          case 'declined': className = 'bg-danger'; break;
          case 'confirmed': className = 'bg-success'; break;
          default: break;
        }

        if (e.action) {
          switch (e.action) {
            case 'create': className = 'bg-primary bg-edit'; break;
            case 'delete': className = 'bg-danger bg-edit'; break;
            case 'approve': className = 'bg-info bg-edit'; break;
            case 'confirm': className = 'bg-success bg-edit'; break;
            case 'decline': className = 'bg-danger bg-edit'; break;
            default: break;
          }
        }

        let display = '';
        if (account.kind === 'faculty') {
          if (!functions.isAdvisory(e.thesis)) {
            display = 'background';
          }
        }

        return {
          id: e._id,
          start: e.start,
          end: e.end,
          title: e.title || '',
          display: e.display || display,
          className
        };
      });
    }
  };

  const handleRangeSelect = e => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      if (api.view.type === 'timeGridWeek') {
        if (account.kind === 'student' && (thesis && thesis.status === 'endorsed')) {
          functions.tryAddDefense(e.start, e.end, eventTitle || thesis.title, thesis);
          api.unselect();
        }
      }
    }
  };

  const handleEventClick = e => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      if (api.view.type === 'timeGridWeek') {
        const event = functions.getEvent(e.event.id);
        if (account.kind === 'student') {
          if (event && functions.isAuthor(event.thesis) && event.status !== 'confirmed') {
            functions.tryRemoveDefense(e.event.id);
          }
        } else if (account.kind === 'faculty') {
          if (event && functions.isAdvisory(event.thesis)) {
            setAdviserEvent(event);
          }
        } else if (account.kind === 'administrator') {
          if (event && event.action === 'create') {
            functions.tryRemoveDefense(e.event.id);
          } else if (event && (event.status === 'approved' || event.status === 'pending')) {
            setAdminEvent(event);
          }
        }
      }
    }
  };

  const handleDateClick = e => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      if (api.view.type === 'dayGridMonth') {
        api.changeView('timeGridWeek', e.dateStr);
      }
    }
  };

  const load = async () => {
    setDefenses(await DefenseService.getDefenses());
    const theses = await ThesisService.getTheses();
    if (account.kind === 'student') {
      if (theses && theses.length > 0) {
        setThesis(theses[0]);
      }
    }
  };

  const handleSelectRequest = request => {
    /*if (calendarRef.current) {
      if (selectedRequest === request) {
        setSelectedRequest(null);
        setTentativeDefenses(null);
      } else {
        setSelectedRequest(request);

        const api = calendarRef.current.getApi();
        const slots = [...request.freeSlots];

        slots.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
        api.changeView('timeGridWeek', slots[0].start);
      }
    }*/
  };

  const handleResetDefense = () => {
    functions.revertAllActions();
  };

  const handleSaveDefense = async () => {
    try {
      setSaving(true);
      const requests = functions.getAllTentativeChanges();
      await DefenseService.processDefenseSlots(requests);
      functions.applyAllActions();
    } catch (error) {
      setError(error.code ? t(error.code) : error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenEventDialog = () => {
    if (account.kind !== 'student' && account.kind !== 'administrator') return;

    setAddEventsDialog(true);
  };

  const handleCloseEventDialog = () => {
    setEventTitle('');
    setEventStartTime('');
    setEventEndTime('');
    setEventDate('');
    setEventThesis(null);
    setDialogError('');
    setDialogValidated(false);
    setAddEventsDialog(false);
  };

  const handleSubmitEventForm = e => {
    const form = e.currentTarget;
    e.preventDefault();
    setDialogError('');
    setDialogValidated(false);

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setDialogValidated(true);
      setDialogError('Please fill out the necessary fields.');
      return;
    }

    if (dayjs(`${eventDate}T${eventStartTime}`).isSameOrAfter(`${eventDate}T${eventEndTime}`)) {
      setDialogError('Start time must be earlier than end time.');
      setDialogValidated(true);
      return;
    }

    if (dayjs().isAfter(`${eventDate}T${eventStartTime}`)) {
      setDialogError('Cannot schedule a defense in the past.');
      setDialogValidated(true);
      return;
    }

    const start = new Date(`${eventDate}T${eventStartTime}`);
    const end = new Date(`${eventDate}T${eventEndTime}`);
    if (eventThesis) {
      functions.tryAddDefense(start, end, eventTitle || eventThesis.title, eventThesis);
    } else if (thesis) {
      functions.tryAddDefense(start, end, eventTitle || thesis.title, thesis);
    }
    handleCloseEventDialog();
  };

  const handleAdviserEventForm = async action => {
    if (!adviserEvent) return;

    try {
      setSaving(true);
      const allActions = [{ _id: adviserEvent._id, action }];
      await DefenseService.processDefenseSlots(allActions);
      functions.applyAllActions(allActions);
      setAdviserEvent(null);
    } catch (error) {
      setError(error.code ? t(error.code) : error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAdminEventForm = async action => {
    if (!adminEvent) return;

    try {
      setSaving(true);
      const allActions = [{ _id: adminEvent._id, action }];
      await DefenseService.processDefenseSlots(allActions);
      functions.applyAllActions(allActions);
      setAdminEvent(null);
    } catch (error) {
      setError(error.code ? t(error.code) : error.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (eventThesis) {
      setEventTitle(eventThesis.title);
    }
  }, [eventThesis]);

  useEffect(() => {
    load();
  }, [account]);

  return (
    <>
      <Row>
        <Col>
          <h3>Defense schedule</h3>
        </Col>
        <Col className='d-flex flex-column align-items-end'>
          <div className='d-flex flex-row align-items-center'>
            { saving && <Spinner /> }
            {
              (account.kind !== 'student' || (thesis && thesis.status === 'endorsed')) &&
                <>
                  <Button className='ms-2' onClick={handleSaveDefense} disabled={!functions.hasTentativeChanges() || saving}>Save</Button>
                  <Button className='ms-2' variant='secondary' onClick={handleResetDefense} disabled={!functions.hasTentativeChanges() || saving}>Reset</Button>
                </>
            }
            <Button className='ms-2' variant='secondary' onClick={() => navigate(-1)} disabled={saving}>Back</Button>
          </div>
        </Col>
      </Row>
      <Row>
        { error && <Alert variant='danger' onClose={() => setError('')} dismissible>{error}</Alert> }
      </Row>
      <Row className='mt-1'>
        <Col md={9}>
          <FullCalendar
            plugins={[ dayGridPlugin, interactionPlugin, timeGridPlugin ]}
            initialView='dayGridMonth'
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            slotMinTime={startTime}
            slotMaxTime={endTime}
            slotDuration={slotInterval}
            select={handleRangeSelect}
            selectable
            hiddenDays={[0]}
            expandRows
            height='75vh'
            headerToolbar={{
              start: 'today,prev,next',
              center: 'title',
              end: 'dayGridMonth,timeGridWeek'
            }}
            events={defenses ? functions.getEvents() : []}
            ref={calendarRef}
          />
          {
            account.kind === 'student' && (thesis && thesis.status === 'endorsed') &&
              <div className='mt-2 d-flex flex-row align-items-center'>
                <p className='text-muted'>You can request defense slots by dragging on the available slots.</p>
                <Button className='ms-auto' onClick={handleOpenEventDialog} disabled={saving}>Request a slot</Button>
              </div>
          }
          {
            account.kind === 'administrator' &&
              <div className='mt-2 d-flex flex-row align-items-center'>
                <Button className='ms-auto' onClick={handleOpenEventDialog} disabled={saving}>Create a slot</Button>
              </div>
          }
        </Col>
        <Col md={3}>
          <Card className='mb-4'>
            <Card.Body>
              <Card.Title>Legend</Card.Title>
              <Card.Text>
                <div className='d-flex flex-row align-items-center'>
                  <div className='bg-light me-2' style={{ width: 16, height: 16, borderRadius: '50%' }}></div>
                  <div>Available</div>
                </div>
                {/* <div className='d-flex flex-row align-items-center'>
                  <div className='bg-dark me-2' style={{ width: 16, height: 16, borderRadius: '50%' }}></div>
                  <div>Unavailable</div>
                </div> */}
                <div className='d-flex flex-row align-items-center'>
                  <div className='bg-warning me-2' style={{ width: 16, height: 16, borderRadius: '50%' }}></div>
                  <div>Pending</div>
                </div>
                <div className='d-flex flex-row align-items-center'>
                  <div className='bg-danger me-2' style={{ width: 16, height: 16, borderRadius: '50%' }}></div>
                  <div>Declined</div>
                </div>
                <div className='d-flex flex-row align-items-center'>
                  <div className='bg-success me-2' style={{ width: 16, height: 16, borderRadius: '50%' }}></div>
                  <div>Confirmed</div>
                </div>
              </Card.Text>
            </Card.Body>
          </Card>
          {
            account.kind === 'student' &&
              <Card>
                <Card.Body>
                  <Card.Title>Defense request status</Card.Title>
                  <Card.Text>
                    {
                      thesis && thesis.status !== 'endorsed' &&
                        'You are not eligible to schedule a defense. Please make sure that your thesis is endorsed by your adviser before requesting slots.'
                    }
                    {
                      thesis && thesis.status === 'endorsed' &&
                        defenses && functions.getOwnRequests().length < 1 && 'You have not requested any slots for defense.'
                    }
                    {
                      thesis && thesis.status === 'endorsed' &&
                        defenses && functions.getOwnRequests().filter(e => e.status === 'confirmed').length > 0 && 'You are now set for defense.' 
                    }
                    {
                      thesis && thesis.status === 'endorsed' &&
                        <ul>
                          <li>{ defenses && functions.getOwnRequests().filter(e => e.status === 'pending').length } slot(s) pending</li>
                          <li>{ defenses && functions.getOwnRequests().filter(e => e.status === 'declined').length } slot(s) declined</li>
                          <li>{ defenses && functions.getOwnRequests().filter(e => e.status === 'confirmed').length } slot(s) confirmed</li>
                        </ul>
                    }
                  </Card.Text>
                </Card.Body>
              </Card>
          }
          {
            account.kind === 'administrator' &&
              <Card>
                <Card.Body>
                  <Card.Title>Defense requests</Card.Title>
                  <Card.Text>
                    <ul>
                      {
                        functions.getThesesWithActiveRequests().map(e => (
                          <>
                            <li key={`active-${e._id}`}>{e.title}</li>
                          </>
                        ))
                      }
                    </ul>
                  </Card.Text>
                </Card.Body>
              </Card>
          }
        </Col>
      </Row>
      <Modal show={addEventsDialog} animation={false} centered size='lg'>
        <Modal.Header>
          <Modal.Title>
            Request defense slot
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmitEventForm}>
          <Modal.Body>
            { dialogError && <Alert variant='danger' onClose={() => setDialogError('')} dismissible>{dialogError}</Alert> }
            {
              account.kind === 'administrator' &&
                <Form.Group className="mb-3" controlId="formTitle">
                  <Form.Label>Thesis</Form.Label>
                  <ThesisSelector value={eventThesis} onChange={e => { console.log(e); setEventThesis(e)}} required />
                </Form.Group>
            }
            <Form.Group className="mb-3" controlId="formTitle">
              <Form.Label>Description</Form.Label>
              <Form.Control as='textarea' rows={3} value={eventDescription} onChange={e => setEventDescription(e.currentTarget.value)} />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3" controlId="formDate">
                  <Form.Label>Date</Form.Label>
                  <Form.Control type='date' value={eventDate} onChange={e => setEventDate(e.currentTarget.value)} required />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3" controlId="formStartTime">
                  <Form.Label>Start time</Form.Label>
                  <Form.Control type='time' value={eventStartTime} onChange={e => setEventStartTime(e.currentTarget.value)} required />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3" controlId="formEndTime">
                  <Form.Label>End time</Form.Label>
                  <Form.Control type='time' value={eventEndTime} onChange={e => setEventEndTime(e.currentTarget.value)} required />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button type='submit'>Add</Button>
            <Button variant='secondary' onClick={handleCloseEventDialog}>Cancel</Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <Modal show={!!adviserEvent} animation={false} centered size='lg'>
        <Modal.Header>
          <Modal.Title>
            { adviserEvent && adviserEvent.title }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row as='dl'>
            <Col as='dt' sm={3}>
              Thesis title
            </Col>
            <Col as='dd' sm={9}>
              { adviserEvent && adviserEvent.thesis.title }
            </Col>
            <Col as='dt' sm={3}>
              Description
            </Col>
            <Col as='dd' sm={9}>
              { adviserEvent && (adviserEvent.thesis.description || 'No description provided') }
            </Col>
            <Col as='dt' sm={3}>
              Date and time
            </Col>
            <Col as='dd' sm={9}>
              { adviserEvent && `${dayjs(adviserEvent.start).format('LL, LT')} - ${dayjs(adviserEvent.end).format('LT')}` }
            </Col>
            <Col as='dt' sm={3}>
              Authors
            </Col>
            <Col as='dd' sm={9}>
              <ul>
                {
                  adviserEvent && adviserEvent.thesis.authors.map(e => (
                    <li key={`author-${e._id}`}>{t('values.full_name', e)}</li>
                  ))
                }
              </ul>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => handleAdviserEventForm('approve')}>Approve</Button>
          <Button onClick={() => handleAdviserEventForm('decline')}>Decline</Button>
          <Button variant='secondary' onClick={() => setAdviserEvent(null)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={!!adminEvent} animation={false} centered size='lg'>
        <Modal.Header>
          <Modal.Title>
            { adminEvent && adminEvent.title }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row as='dl'>
            <Col as='dt' sm={3}>
              Thesis title
            </Col>
            <Col as='dd' sm={9}>
              { adminEvent && adminEvent.thesis.title }
            </Col>
            <Col as='dt' sm={3}>
              Description
            </Col>
            <Col as='dd' sm={9}>
              { adminEvent && (adminEvent.thesis.description || 'No description provided') }
            </Col>
            <Col as='dt' sm={3}>
              Date and time
            </Col>
            <Col as='dd' sm={9}>
              { adminEvent && `${dayjs(adminEvent.start).format('LL, LT')} - ${dayjs(adminEvent.end).format('LT')}` }
            </Col>
            <Col as='dt' sm={3}>
              Authors
            </Col>
            <Col as='dd' sm={9}>
              <ul>
                {
                  adminEvent && adminEvent.thesis.authors.map(e => (
                    <li key={`author-${e._id}`}>{t('values.full_name', e)}</li>
                  ))
                }
              </ul>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => handleAdminEventForm('confirm')}>Confirm</Button>
          <Button onClick={() => handleAdminEventForm('decline')}>Decline</Button>
          <Button variant='secondary' onClick={() => setAdminEvent(null)}>Cancel</Button>
        </Modal.Footer>
      </Modal>
      {
        account.kind === 'student' && thesis &&
          <Modal show={thesis.status !== 'endorsed' && endorseNotice} animation={false} centered size='lg'>
            <Modal.Header>
              <Modal.Title>
                Notice
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Please ensure that your thesis is endorsed before accessing this page.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={() => navigate(-1)}>Leave</Button>
            </Modal.Footer>
          </Modal>
      }
    </>
  );
}

export default DefenseWeekPage;
