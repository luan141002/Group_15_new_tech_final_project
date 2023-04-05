import { useEffect, useRef, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Table from 'react-bootstrap/Table';
import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayjs from 'dayjs';
import ThesisSelector from '../components/ThesisSelector';
import { useAccount } from '../providers/account';
import AccountService from '../services/AccountService';
import DefenseService from '../services/DefenseService';
import ThesisService from '../services/ThesisService';

function EditDefenseEventDialog(props) {
  const { account } = useAccount();
  const { t } = useTranslation();
  const { open, event, error, onCancel, onAction, studentThesis } = props;
  const [_error, _setError] = useState('');
  const [errorOpen, setErrorOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [thesis, setThesis] = useState(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [panelists, setPanelists] = useState([]);
  const [phase, setPhase] = useState(undefined);
  const edit = !event || event.action === 'create';

  const [faculty, setFaculty] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState([]);

  const handleSubmit = async e => {
    const form = e.currentTarget;
    e.preventDefault();
    if (onAction) {

      if (form.checkValidity() === false) {
        e.stopPropagation();
        //setDialogValidated(true);
        _setError('Please fill out the necessary fields.');
        return;
      }
  
      if (dayjs(`${date}T${startTime}`).isSameOrAfter(`${date}T${endTime}`)) {
        _setError('Start time must be earlier than end time.');
        //setDialogValidated(true);
        return;
      }
  
      if (dayjs().isAfter(`${date}T${startTime}`)) {
        _setError('Cannot schedule a defense in the past.');
        //setDialogValidated(true);
        return;
      }
  
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);

      const action = event ? 'update' : 'create';
      setSaving(true);
      try {
        const result = onAction(action, {
          _id: event ? event._id : undefined,
          thesis,
          description,
          start,
          end,
          phase,
          panelists
        });
        if (result && result.then) {
          await result;
        }
      } catch (error) {
        _setError(error.code ? t(error.code) : error.message);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleSearchFaculty = async (q) => {
    setFacultyLoading(true);
    const faculty = await AccountService.getFaculty({ q });
    setFaculty(faculty);
    setFacultyLoading(false);
  };

  const canAddFaculty = () => {
    if (selectedFaculty.length < 1) return false;
    if (panelists.find(e => e._id === selectedFaculty[0]._id)) return false;
    if (panelists.length >= 4) return false;
    return true;
  };

  const handleAddFaculty = () => {
    if (selectedFaculty.length < 1) return;
    if (!canAddFaculty()) return;
    setPanelists(prev => {
      const value = faculty.find(e => e._id === selectedFaculty[0]._id);
      return [ ...prev, value ];
    });
    setSelectedFaculty([]);
  };

  const handleRemoveFaculty = (id) => {
    setPanelists(prev => prev.filter(e => e._id !== id));
  };

  const doAction = async action => {
    if (onAction) {
      setSaving(true);
      try {
        const result = onAction(action, event ? event._id : undefined);
        if (result && result.then) {
          await result;
        }
      } catch (error) {
        _setError(error.code ? t(error.code) : error.message);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  }

  useEffect(() => {
    setErrorOpen(!!error);
  }, [error, _error]);

  useEffect(() => {
    if (event) {
      setThesis(event.thesis);
      setDescription(event.description);
      setDate(dayjs(event.start).format('YYYY-MM-DD'));
      setStartTime(dayjs(event.start).format('HH:mm'));
      setEndTime(dayjs(event.end).format('HH:mm'));
      setPhase(event.phase);
      setPanelists(event.panelists ? event.panelists.map(e => e.faculty) : []);
    } else {
      setThesis(null);
      setDescription('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setPhase(undefined);
      setPanelists([]);
    }
  }, [event]);

  useEffect(() => {
    if (studentThesis) {
      setPanelists([
        ...studentThesis.advisers,
        ...studentThesis.panelists
      ]);
      setPhase(studentThesis.phase);
      setDescription(studentThesis.title);
    }
  }, [open, studentThesis]);

  const showDelete = () => {
    if (!account || !event) return false;
    if (account.kind === 'administrator') return true;
    if (account.kind === 'faculty') return false;
    if (account.kind === 'student') {
      if (event.status === 'confirmed') return false;
      if (event.action === 'create') return true;
      if (event.thesis.authors.find(e => e._id === account.accountID)) return true;
      return false;
    }
    return false;
  };

  const showConfirm = () => {
    if (!account) return false;
    if (account.kind === 'administrator') return event && event.status === 'approved';
    return false;
  };

  const showApprove = () => {
    if (!account) return false;
    if (account.kind === 'faculty') {
      if (!event) return false;
      const isPending = event.status === 'pending';
      const hasApproved = event.panelists.some(e => e.faculty._id === account.accountID && e.approved);
      const hasDeclined = event.status === 'declined' || event.panelists.some(e => e.declined);
      return isPending && !hasApproved && !hasDeclined;
    }
    return false;
  };

  const showDecline = () => {
    if (!account) return false;
    if (account.kind === 'student') return false;
    if (account.kind === 'administrator') return event && (event.action === 'pending' || event.status === 'approved');
    if (account.kind === 'faculty') {
      if (!event) return false;
      const isPending = event.status === 'pending';
      const hasApproved = event.panelists.some(e => e.faculty._id === account.accountID && e.approved);
      const hasDeclined = event.status === 'declined' || event.panelists.some(e => e.declined);
      return isPending && !hasApproved && !hasDeclined;
    }
    return false;
  };

  const handleChangeThesis = value => {
    setThesis(value);
    if (value) {
      setPhase(value.phase);
      setPanelists([...value.advisers, ...value.panelists]);
    }
  };

  const getTitle = () => {
    if (!edit) return 'Defense event summary';
    if (account) {
      if (account.kind === 'student') return 'Request defense slot';
    }
    return 'Create defense slot';
  };

  return (
    <Modal show={open} animation={false} centered size='lg'>
      <Modal.Header>
        <Modal.Title>
          {getTitle()}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          { (error || _error) && errorOpen && <Alert variant='danger' onClose={() => setErrorOpen(false)} dismissible>{error || _error}</Alert> }
          {
            edit ? <>
              {
                account && account.kind === 'administrator' &&
                  <Form.Group className="mb-3" controlId="formTitle">
                    <Form.Label>Thesis</Form.Label>
                    <ThesisSelector value={thesis} onChange={handleChangeThesis} required disabled={saving} />
                  </Form.Group>
              }
              <Form.Group className="mb-3" controlId="formTitle">
                <Form.Label>Description</Form.Label>
                <Form.Control as='textarea' rows={3} value={description} onChange={e => setDescription(e.currentTarget.value)} disabled={saving} />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3" controlId="formDate">
                    <Form.Label>Date</Form.Label>
                    <Form.Control type='date' value={date} onChange={e => setDate(e.currentTarget.value)} required disabled={saving} />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="formStartTime">
                    <Form.Label>Start time</Form.Label>
                    <Form.Control type='time' value={startTime} onChange={e => setStartTime(e.currentTarget.value)} required disabled={saving} />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3" controlId="formEndTime">
                    <Form.Label>End time</Form.Label>
                    <Form.Control type='time' value={endTime} onChange={e => setEndTime(e.currentTarget.value)} required disabled={saving} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3" controlId="formAdviser">
                <Form.Label>Panelists</Form.Label>
                <Row className="align-items-center">
                  <Col xs={9} sm={10} className="my-1">
                    <AsyncTypeahead
                      id='formFaculty'
                      filterBy={(faculty) => !panelists.includes(faculty._id)}
                      isLoading={facultyLoading}
                      labelKey={(option) => t('values.full_name', option)}
                      minLength={2}
                      onSearch={handleSearchFaculty}
                      options={faculty}
                      onChange={setSelectedFaculty}
                      selected={selectedFaculty}
                      placeholder='Search from faculty...'
                      useCache={false}
                      disabled={saving}
                    />
                  </Col>
                  <Col xs={3} sm={2} className="my-1">
                    <Button className='w-100' onClick={handleAddFaculty} disabled={!canAddFaculty() || saving}>Add</Button>
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
                    panelists.length > 0 ? panelists.map(e => (
                      <tr>
                        <td>{e.lastName}</td>
                        <td>{e.firstName}</td>
                        <td>
                          <Button as='a' variant='link' style={{ padding: 0 }} onClick={() => handleRemoveFaculty(e._id)} disabled={saving}>
                            Remove
                          </Button>
                        </td>
                      </tr>
                    )) : <tr><td className='text-center' colSpan={3}>No panelists added.</td></tr>
                  }
                </tbody>
              </Table>
            </> : <>
              <Row as='dl'>
                <Col as='dt' sm={3}>
                  Thesis title
                </Col>
                <Col as='dd' sm={9}>
                  { event && event.thesis.title }
                </Col>
                <Col as='dt' sm={3}>
                  Description
                </Col>
                <Col as='dd' sm={9}>
                  { event && (event.thesis.description || 'No description provided') }
                </Col>
                <Col as='dt' sm={3}>
                  Date and time
                </Col>
                <Col as='dd' sm={9}>
                  { event && `${dayjs(event.start).format('LL, LT')} - ${dayjs(event.end).format('LT')}` }
                </Col>
                <Col as='dt' sm={3}>
                  Authors
                </Col>
                <Col as='dd' sm={9}>
                  <ul>
                    {
                      event && event.thesis.authors.map(e => (
                        <li key={`author-${e._id}`}>{t('values.full_name', e)}</li>
                      ))
                    }
                  </ul>
                </Col>
                <Col as='dt' sm={3}>
                  Panelists
                </Col>
                <Col as='dd' sm={9}>
                  <ul>
                    {
                      event && event.panelists.map(e => (
                        <li
                          key={`panelist-${e.faculty._id}`}
                        >
                          {t('values.full_name', e.faculty)} {e.declined ? '(Declined)' : (e.approved ? '(Approved)' : '(Not yet approved)')}
                        </li>
                      ))
                    }
                  </ul>
                </Col>
                <Col as='dt' sm={3}>
                  Status
                </Col>
                <Col as='dd' sm={9}>
                  { event && t(`values.defense_status.${event.status}`) }
                </Col>
              </Row>
            </>
          }
        </Modal.Body>
        <Modal.Footer>
          { edit && <Button type='submit' disabled={saving}>{ event ? 'Update' : 'Add' }</Button> }
          { showApprove() && <Button variant='secondary' onClick={() => doAction('approve')} disabled={saving}>Approve</Button> }
          { showConfirm() && <Button variant='secondary' onClick={() => doAction('confirm')} disabled={saving}>Confirm</Button> }
          { showDecline() && <Button variant='secondary' onClick={() => doAction('decline')} disabled={saving}>Decline</Button> }
          { showDelete() && <Button variant='secondary' onClick={() => doAction('delete')} disabled={saving}>Delete</Button> }
          <Button variant='secondary' onClick={handleCancel} disabled={saving}>{ edit ? 'Cancel' : 'Close' }</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

function DefenseWeekPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { account } = useAccount();
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:00');
  const [slotInterval, setSlotInterval] = useState(15 * 60 * 1000);
  const [defenses, setDefenses] = useState([]);
  const calendarRef = useRef(null);
  const [thesis, setThesis] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [endorseNotice, setEndorseNotice] = useState(true);

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const colorPalette = {
    pending: {
      display: 'Pending',
      textColor: '#000',
      backgroundColor: '#ffdfba'
    },
    approved: {
      display: 'Approved',
      textColor: '#000',
      backgroundColor: '#ffffba'
    },
    confirmed: {
      display: 'Confirmed',
      textColor: '#000',
      backgroundColor: '#baffc9'
    },
    declined: {
      display: 'Declined',
      textColor: '#000',
      backgroundColor: '#ffb3ba'
    },
    create: {
      display: 'Create',
      textColor: '#000',
      backgroundColor: '#bae1ff',
      hidden: true
    }
  };

  const functions = {
    isAuthor: (thesis) => {
      return thesis.authors.find(e => e._id === account.accountID);
    },

    isAdvisory: (thesis) => {
      return thesis.advisers.find(e => e._id === account.accountID);
    },

    isPanelist: (defense) => {
      return defense.panelists.find(e => e.faculty._id === account.accountID);
    },

    hasAccountApproved: (defense) => {
      return defense.panelists.some(e => e.faculty._id === account.accountID && e.approved);
    },

    tryAddDefense: (info) => {
      const { start, end, thesis, description, phase, panelists } = info;
      console.log(phase);
      setDefenses(prev => {
        const next = [ ...prev ];
        next.push({
          _id: start.getTime().toString(),
          start,
          end,
          thesis,
          description,
          phase,
          panelists,
          action: 'create'
        });
        return next;
      });
    },

    tryUpdateDefenseData: (id, info) => {
      const { start, end, thesis, description, phase, panelists } = info;
      setDefenses(prev => {
        const defenseI = prev.findIndex(e => e._id === id);
        if (defenseI === -1) return prev;

        let defense = { ...prev[defenseI] };
        if (defense.action === 'create') {
          defense.start = start;
          defense.end = end;
          defense.thesis = thesis;
          defense.phase = phase;
          defense.description = description;
          defense.panelists = panelists;
        } else {
          defense.description = description;
          defense.panelists = panelists;
        }
        const next = [ ...prev ];
        next[defenseI] = defense;
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
        const next2 = next.map(e => {
          let action = '';
          if (allActions) {
            const actionItem = allActions.find(e2 => e2._id === e._id);
            if (actionItem) action = actionItem.action;
          }

          const { action: _, ...copy } = e;
          if (!action) action = e.action;

          switch (action) {
            case 'approve': {
              const panelistEntry = copy.panelists.find(e => e.faculty._id === account.accountID);
              if (panelistEntry) panelistEntry.approved = true;
              if (copy.panelists.every(e => e.approved)) copy.status = 'approved';
            } break;
            case 'decline': {
              const panelistEntry = copy.panelists.find(e => e.faculty._id === account.accountID);
              if (panelistEntry) panelistEntry.declined = true;
              copy.status = 'declined';
            } break;
            case 'confirm': copy.status = 'confirmed'; break;
            case 'create':
              copy.status = account.kind === 'administrator' ? 'confirmed' : 'pending';
              copy.panelists = copy.panelists.map(e => ({ faculty: e, approved: false }));
              break;
            default: break;
          }
          return copy;
        });
        return next2;
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
          return thesis && e.phase === thesis.phase;
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

        const paletteEntry = colorPalette[e.status];
        let { textColor, backgroundColor } = paletteEntry;

        if (e.action) {
          switch (e.action) {
            case 'create': backgroundColor = colorPalette.create.backgroundColor; className = 'bg-edit'; break;
            case 'delete': backgroundColor = colorPalette.declined.backgroundColor; className = 'bg-edit'; break;
            default: break;
          }
        }

        let display = '';
        let title = e.description || e.thesis.title;
        if (account.kind === 'faculty') {
          if (!functions.isPanelist(e)) {
            display = 'background';
          } else {
            if (e.status === 'pending' && !functions.hasAccountApproved(e)) {
              title = `*${title}`;
            }
          }
        }

        return {
          id: e._id,
          start: e.start,
          end: e.end,
          title,
          display: e.display || display,
          className,
          textColor,
          backgroundColor
        };
      });
    }
  };

  const handleRangeSelect = e => {
    if (calendarRef.current) {
      const api = calendarRef.current.getApi();
      if (api.view.type === 'timeGridWeek') {
        if (account.kind === 'student' && (thesis && thesis.status === 'endorsed')) {
          functions.tryAddDefense({
            start: e.start,
            end: e.end,
            description: thesis.title,
            thesis: thesis,
            phase: thesis.phase,
            panelists: [...thesis.advisers, ...thesis.panelists]
          });
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
        setSelectedEvent(event);
        setEventDialogOpen(true);
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
    if (account.kind === 'student') {
      const theses = await ThesisService.getTheses();
      if (theses && theses.length > 0) {
        setThesis(theses[0]);
      }
    }
  };

  const handleOpenEventDialog = () => {
    setSelectedEvent(null);
    setEventDialogOpen(true);
  };

  const handleCloseEventDialog = () => {
    setEventDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEventAction = async (action, data) => {
    if (action === 'create') {
      functions.tryAddDefense(data);
      setSelectedEvent(null);
      setEventDialogOpen(false);
    } else if (action === 'update') {
      functions.tryUpdateDefenseData(data._id, data);
      setSelectedEvent(null);
      setEventDialogOpen(false);
    } else if (action === 'delete') {
      functions.tryRemoveDefense(data);
      setSelectedEvent(null);
      setEventDialogOpen(false);
    } else if (action === 'approve' || action === 'decline' || action === 'confirm') {
      const allActions = [{ _id: data, action }];
      await DefenseService.processDefenseSlots(allActions);
      functions.applyAllActions(allActions);
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
      const pending = functions.getAllTentativeChanges();
      await DefenseService.processDefenseSlots(pending);
      functions.applyAllActions();
    } catch (error) {
      setError(error.code ? t(error.code) : error.message);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    load();
  }, [account]);

  return (
    <>
      <Row>
        <Col>
          <h3>Defense Schedule</h3>
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
                {
                  Object.values(colorPalette).filter(e => !e.hidden).map(e => (
                    <div className='d-flex flex-row align-items-center'>
                      <div className='me-2' style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid #ccc', backgroundColor: e.backgroundColor }}></div>
                      <div>{e.display}</div>
                    </div>
                  ))
                }
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
                        defenses && functions.getOwnRequests().filter(e => e.phase === thesis.phase).length < 1 && 'You have not requested any slots for defense.'
                    }
                    {
                      thesis && thesis.status === 'endorsed' &&
                        defenses && functions.getOwnRequests().filter(e => e.status === 'confirmed' && e.phase === thesis.phase).length > 0 && 'You are now set for defense.' 
                    }
                    {
                      thesis && thesis.status === 'endorsed' &&
                        <ul>
                          <li>{ defenses && functions.getOwnRequests().filter(e => e.phase === thesis.phase && e.status === 'pending').length } slot(s) pending</li>
                          <li>{ defenses && functions.getOwnRequests().filter(e => e.phase === thesis.phase && e.status === 'declined').length } slot(s) declined</li>
                          <li>{ defenses && functions.getOwnRequests().filter(e => e.phase === thesis.phase && e.status === 'confirmed').length } slot(s) confirmed</li>
                        </ul>
                    }
                  </Card.Text>
                </Card.Body>
              </Card>
          }
          {/*
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
          */}
        </Col>
      </Row>
      <EditDefenseEventDialog
        event={selectedEvent}
        open={eventDialogOpen}
        onCancel={handleCloseEventDialog}
        onAction={handleEventAction}
        studentThesis={thesis}
      />
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
