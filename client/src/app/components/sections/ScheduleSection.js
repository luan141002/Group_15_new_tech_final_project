import { cloneDeep, merge } from "lodash"
import { useEffect, useState } from "react"
import { Helmet } from "react-helmet"
import { Alert, Button, Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row } from "reactstrap"
import Calendar, { daysOfWeekShort } from "../../components/calendar"
import ScheduleService from "../../services/ScheduleService"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

function createFormState() {
  return {
    name: '',
    description: '',
    type: '',
    repeating: false,
    startPeriod: '',
    endPeriod: '',
    startTime: '',
    endTime: '',
    repeat: ''
  }
}

const typeToDisplay = (type) => {
  switch (type) {
    case 'personal': return 'Personal'
    case 'global': return 'Global'
    case 'defense': return 'Defense'
    default: return `--- Unknown type ${type} ---`
  }
}

function ScheduleSection(props) {
  const { allowedTypes } = props

  const currentDate = new Date()
  const [schedules, setSchedules] = useState([])
  const [year, setYear] = useState(currentDate.getFullYear())
  const [month, setMonth] = useState(currentDate.getMonth())
  const [form, setForm] = useState(createFormState())
  const [formId, setFormId] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteFormOpen, setDeleteFormOpen] = useState(false)
  const [deleteFormError, setDeleteFormError] = useState('')
  const [deleteId, setDeleteId] = useState('')

  const updateForm = (partial) => {
    setForm(prev => merge(cloneDeep(prev), partial))
  }

  const updateFormField = (name) => (event) => {
    const value = event.target.value
    updateForm({ [name]: value })
  }

  const updateFormCheckField = (name) => (event) => {
    const value = event.target.checked
    updateForm({ [name]: value })
  }

  const deserializeRepeat = (repeat) => {
    const array = repeat.split('')
    array.sort()
    return array
  }

  const serializeRepeat = (repeat) => {
    const array = cloneDeep(repeat)
    array.sort()
    return array.join('')
  }

  const getRepeatValue = (index, repeat) => {
    return repeat.includes(index.toString())
  }

  const updateFormRepeat = (day) => (event) => {
    const checked = event.target.checked
    let list = deserializeRepeat(form.repeat)
    if (checked) list.push(day.toString())
    else list = list.filter(e => e !== day.toString())
    updateForm({ repeat: serializeRepeat(list) })
  }

  const onChange = (year, month) => {
    setYear(year)
    setMonth(month)
  }

  const onClickEvent = (scheduleId) => {
    const schedule = schedules.find(e => e.id === scheduleId)
    if (schedule) {
      openModal(schedule)()
    }
  }

  const onClickEvent2 = (eventInfo) => {
    const { event } = eventInfo
    const schedule = schedules.find(e => e.id.toString() === event.id)
    if (schedule) {
      openModal(schedule)()
    }
  }

  const openModal = (data) => () => {
    setFormId(data ? data.id : '')
    setForm(data || createFormState())
    setFormOpen(true)
  }

  const openDeleteModal = (id) => () => {
    setDeleteId(id)
    setDeleteFormOpen(true)
  }

  const closeModal = () => {
    setFormError('')
    setFormOpen(false)
    setDeleteId('')
    setDeleteFormOpen(false)
  }

  const load = async () => {
    try {
      const scheduleList = await ScheduleService.getSchedules()
      setSchedules(scheduleList)
    } catch (error) {

    }
  }

  const onAdd = async () => {
    try {
      if (formId) {
        await ScheduleService.updateSchedule(formId, form)
      } else {
        await ScheduleService.createSchedule(form)
      }
      await load()
      closeModal()
    } catch (error) {
      setFormError(error.message)
    }
  }

  const onDelete = async () => {
    try {
      await ScheduleService.deleteSchedule(deleteId)
      await load()
      closeModal()
    } catch (error) {
      setDeleteFormError(error.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Schedule' content='width=device-width, initial-scale=1.0' />
        <title>Schedule</title>
      </Helmet>
      <Modal isOpen={formOpen} fade={false} centered scrollable size='lg'>
        <ModalHeader>{ formId ? 'Update' : 'Add' } schedule</ModalHeader>
        <ModalBody>
          <FormGroup floating>
            <Input id='schedule-name' type='text' name='name' placeholder='Name' value={form.name} onChange={updateFormField('name')} />
            <Label for='schedule-name'>Name</Label>
          </FormGroup>
          <FormGroup floating>
            <Input id='schedule-description' type='textarea' name='description' placeholder='Description' value={form.description} onChange={updateFormField('description')} />
            <Label for='schedule-description'>Description</Label>
          </FormGroup>
          {
            formId ?
              <FormGroup floating>
                <Input id='schedule-type-ro' type='type' name='type' placeholder='Type' value={form.type} readOnly />
                <Label for='schedule-type-ro'>Type</Label>
              </FormGroup>
              :
              <FormGroup floating>
                <Input id='schedule-type' type='select' name='type' value={form.type} onChange={updateFormField('type')}>
                  <option>--- Select type ---</option>
                  {
                    allowedTypes && allowedTypes.map(e => (
                      <option value={e}>{typeToDisplay(e)}</option>
                    ))
                  }
                </Input>
                <Label for='schedule-type'>Type</Label>
              </FormGroup>
          }
          <FormGroup check>
            <Input id='schedule-repeating' type='checkbox' name='repeating' checked={form.repeating} onChange={updateFormCheckField('repeating')} />
            <Label for='schedule-repeating'>Repeating schedule</Label>
          </FormGroup>
          {
            form.repeating ? <>
              <Row>
                <Col>
                  <FormGroup floating>
                    <Input id='schedule-startPeriod' type='date' name='startPeriod' placeholder='Start Date' value={form.startPeriod} onChange={updateFormField('startPeriod')} />
                    <Label for='schedule-startPeriod'>Start Date</Label>
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup floating>
                    <Input id='schedule-endPeriod' type='date' name='endPeriod' placeholder='End Date' value={form.endPeriod} onChange={updateFormField('endPeriod')} />
                    <Label for='schedule-endPeriod'>End Date</Label>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup floating>
                    <Input id='schedule-startTime' type='time' name='startTime' placeholder='Start Time' value={form.startTime} onChange={updateFormField('startTime')} />
                    <Label for='schedule-startTime'>Start Time</Label>
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup floating>
                    <Input id='schedule-endTime' type='time' name='endTime' placeholder='End Time' value={form.endTime} onChange={updateFormField('endTime')} />
                    <Label for='schedule-endTime'>End Time</Label>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Label>Repeat</Label>
                </Col>
              </Row>
              <Row>
                {
                  daysOfWeekShort.map((dayOfWeek, i) => (
                    <Col key={`dayOfWeek-${i}`}>
                      <FormGroup check>
                        <Input id={`schedule-repeat${i}`} type='checkbox' name={`repeat${i}`} checked={getRepeatValue(i, form.repeat)} onChange={updateFormRepeat(i)} />
                        <Label for={`schedule-repeat${i}`}>{dayOfWeek}</Label>
                      </FormGroup>
                    </Col>
                  ))
                }
              </Row>
            </> : <>
              <Row>
                <Col>
                  <FormGroup floating>
                    <Input id='schedule-date' type='date' name='date' placeholder='Date' value={form.startPeriod} onChange={updateFormField('startPeriod')} />
                    <Label for='schedule-date'>Date</Label>
                  </FormGroup>
                </Col>
              </Row>
              <Row>
                <Col>
                  <FormGroup floating>
                    <Input id='schedule-startTime' type='time' name='startTime' placeholder='Start Time' value={form.startTime} onChange={updateFormField('startTime')} />
                    <Label for='schedule-startTime'>Start Time</Label>
                  </FormGroup>
                </Col>
                <Col>
                  <FormGroup floating>
                    <Input id='schedule-endTime' type='time' name='endTime' placeholder='End Time' value={form.endTime} onChange={updateFormField('endTime')} />
                    <Label for='schedule-endTime'>End Time</Label>
                  </FormGroup>
                </Col>
                <Col>
                  <Button onClick={() => {
                    updateForm({
                      startTime: '00:00',
                      endTime: '23:59'
                    })
                  }}>All day</Button>
                </Col>
              </Row>
            </>
          }
          { formError && <Alert color='danger'>{formError}</Alert> }
        </ModalBody>
        <ModalFooter>
          { formId && <Button color='danger' onClick={() => openDeleteModal(formId)()}>Delete</Button> }
          <Button onClick={onAdd}>{ formId ? 'Update' : 'Add'}</Button>
          <Button onClick={closeModal}>Close</Button>
        </ModalFooter>
      </Modal>
      <Modal isOpen={deleteFormOpen} fade={false} centered scrollable>
        <ModalHeader>Delete schedule</ModalHeader>
        <ModalBody>
          This action cannot be undone.
          { deleteFormError && <Alert color='danger'>{deleteFormError}</Alert> }
        </ModalBody>
        <ModalFooter>
          <Button onClick={onDelete} color='danger'>Delete</Button>
          <Button onClick={closeModal}>Close</Button>
        </ModalFooter>
      </Modal>
      <div className='tm-row'>
        <div className='tm-column'>
          <div className='tm-group'>
            <h2 className="tm-group-name">Schedule</h2>
            <Button onClick={openModal()}>Add</Button>
            <FullCalendar
              contentHeight='60vh'
              plugins={[dayGridPlugin, interactionPlugin]}
              selectable
              eventClick={onClickEvent2}
              events={schedules ? schedules.map(e => {
                if (e.repeating) {
                  const obj = {
                    id: e.id || e._id,
                    daysOfWeek: e.repeat.split('').map(e => Number.parseInt(e)),
                    startRecur: new Date(`${e.startPeriod}T00:00:00`),
                    endRecur: new Date(`${e.endPeriod}T23:59:59`),
                    startTime: e.startTime,
                    endTime: e.endTime,
                    title: e.name
                  }
                  return obj
                } else {
                  return {
                    id: e.id || e._id,
                    start: new Date(`${e.startPeriod}T${e.startTime}:00`),
                    end: new Date(`${e.startPeriod}T${e.startTime}:00`),
                    title: e.name
                  }
                }
              }) : []} />
          </div>
        </div>
      </div>
    </>
  )
}

export default ScheduleSection
