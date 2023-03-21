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
import DefenseService from '../../services/DefenseService';
import { useAccount } from '../../providers/account';
import ThesisService from '../../services/ThesisService';

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

  const [addEventsDialog, setAddEventsDialog] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventDate, setEventDate] = useState('');

  const functions = {
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
      return defenses.filter(e => !!e.action);
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

    revertAllActions: () => {
      setDefenses(prev => prev.filter(e => e.action !== 'create').map(e => {
        const { action, ...rest } = e;
        return rest;
      }));
    },

    applyAllActions: () => {
      setDefenses(prev => {
        const next = prev.filter(e => e.action !== 'delete');
        return next.map(e => {
          const { action, ...copy } = e;
          switch (action) {
            case 'approve': copy.status = 'approved'; break;
            case 'decline': copy.status = 'declined'; break;
            case 'confirm': copy.status = 'confirmed'; break;
            case 'create':
            default: copy.status = 'pending'; break;
          }
          return copy;
        });
      });
    },

    selectThesis: thesis => {

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
            default: break;
          }
        }

        return {
          id: e._id,
          start: e.start,
          end: e.end,
          title: e.title || '',
          display: e.display,
          className
        };
      });
    }
  };

  const handleRangeSelect = e => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      if (api.view.type === 'timeGridWeek') {
        functions.tryAddDefense(e.start, e.end, eventTitle || thesis.title, thesis._id);
        api.unselect();
      }
    }
  };

  const handleEventClick = e => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      if (api.view.type === 'timeGridWeek') {
        if (account.kind === 'student') {
          functions.tryRemoveDefense(e.event.id);
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
    if (theses && theses.length > 0) {
      setThesis(theses[0]);
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
    if (account.kind !== 'student') return;

    setAddEventsDialog(true);
  };

  const handleCloseEventDialog = () => {
    setEventTitle('');
    setEventStartTime('');
    setEventEndTime('');
    setEventDate('');
    setAddEventsDialog(false);
  };

  const handleSubmitEventForm = e => {
    e.preventDefault();
    const start = new Date(`${eventDate}T${eventStartTime}`);
    const end = new Date(`${eventDate}T${eventEndTime}`);
    functions.tryAddDefense(start, end, eventTitle || thesis.title, thesis._id);
    handleCloseEventDialog();
  };

  useEffect(() => {
    /*setDefenses([
      {
        _id: '1',
        start: '2023-03-27T08:00:00',
        end: '2023-03-27T18:00:00',
        display: 'background',
        className: 'bg-secondary cursor-blocked'
      },
      {
        _id: '2',
        start: '2023-03-31T08:00:00',
        end: '2023-03-31T18:00:00',
        display: 'background',
      },
      {
        _id: '3',
        start: '2023-03-29T12:00:00',
        end: '2023-03-29T18:00:00',
        display: 'background',
      },
      {
        _id: '4',
        start: '2023-03-29T10:00:00',
        title: 'Reserved',
        end: '2023-03-29T11:00:00',
      },
      {
        _id: '5',
        start: '2023-03-29T10:00:00',
        end: '2023-03-29T11:00:00',
        title: 'Reserved',
      },
      {
        _id: '6',
        start: '2023-03-29T10:00:00',
        end: '2023-03-29T11:00:00',
        title: 'Reserved',
      },
      {
        _id: '7',
        start: '2023-03-29T10:00:00',
        end: '2023-03-29T11:00:00',
        title: 'Reserved',
      },
    ]);*/

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
            <Button className='ms-2' onClick={handleSaveDefense} disabled={!functions.hasTentativeChanges() || saving}>Save</Button>
            <Button className='ms-2' variant='secondary' onClick={handleResetDefense} disabled={!functions.hasTentativeChanges() || saving}>Reset</Button>
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
            events={functions.getEvents()}
            ref={calendarRef}
          />
          {
            account.kind === 'student' &&
              <div className='mt-2 d-flex flex-row align-items-center'>
                <p className='text-muted'>You can request defense slots by dragging on the available slots.</p>
                <Button className='ms-auto' onClick={handleOpenEventDialog} disabled={saving}>Request a slot</Button>
              </div>
          }
        </Col>
        <Col md={3}>
          {
            account.kind === 'student' &&
              <Card>
                <Card.Body>
                  <Card.Title>Defense request status</Card.Title>
                  <Card.Text>
                    { defenses && functions.getOwnRequests().length < 1 && 'You have not requested any slots for defense.' }
                    { defenses && functions.getOwnRequests().filter(e => e.status === 'confirmed').length > 0 && 'You are now set for defense.' }
                    <ul>
                      <li>{ defenses && functions.getOwnRequests().filter(e => e.status === 'pending').length } slot(s) pending</li>
                      <li>{ defenses && functions.getOwnRequests().filter(e => e.status === 'declined').length } slot(s) declined</li>
                      <li>{ defenses && functions.getOwnRequests().filter(e => e.status === 'confirmed').length } slot(s) confirmed</li>
                    </ul>
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
                            <li>{e.title}</li>
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
            <Row>
              <Form.Group className="mb-3" controlId="formTitle">
                <Form.Label>Title</Form.Label>
                <Form.Control type='text' placeholder={thesis ? thesis.title : ''} value={eventTitle} onChange={e => setEventTitle(e.currentTarget.value)} />
              </Form.Group>
              <Col>
                <Form.Group className="mb-3" controlId="formStartTime">
                  <Form.Label>Start time</Form.Label>
                  <Form.Control type='time' value={eventStartTime} onChange={e => setEventStartTime(e.currentTarget.value)} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3" controlId="formEndTime">
                  <Form.Label>End time</Form.Label>
                  <Form.Control type='time' value={eventEndTime} onChange={e => setEventEndTime(e.currentTarget.value)} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3" controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control type='date' value={eventDate} onChange={e => setEventDate(e.currentTarget.value)} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button type='submit'>Add</Button>
            <Button variant='secondary' onClick={handleCloseEventDialog}>Cancel</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default DefenseWeekPage;
