import { useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet"
import { Alert, Button, FormGroup, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"
import Calendar from "../../components/calendar"
import { checkAccount, useAccount } from "../../providers/account"
import ScheduleService from "../../services/ScheduleService"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import icalendarPlugin from '@fullcalendar/icalendar'
import { clone } from "lodash"

function DefensePage() {
  const { account } = useAccount()
  const canScheduleDefense = checkAccount(account, 'faculty.coordinator')

  const currentDate = new Date()
  const [counter, setCounter] = useState(0)
  const [schedule, setSchedule] = useState([])
  const [defenseSchedule, setDefenseSchedule] = useState(null)
  const defSlotCalendarRef = useRef(null)

  const [defSlots, setDefSlots] = useState([])
  const [defSlotInfoForm, setDefSlotInfoForm] = useState(null)
  const [defSlotInfoModalOpen, setDefSlotInfoModalOpen] = useState(false)

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [formError, setFormError] = useState('')
  const [year, setYear] = useState(currentDate.getFullYear())
  const [month, setMonth] = useState(currentDate.getMonth())

  const onChange = (year, month) => {
    setYear(year)
    setMonth(month)
  }

  const openModal = () => {
    setDefenseSchedule(null)
    setFormError('')
    setDefSlots([])
    setScheduleModalOpen(true)
  }

  const appendDefSlot = (slot) => {
    setDefSlots(prev => {
      const next = clone(prev)
      next.push(slot)
      return next
    })
  }

  const closeModal = () => {
    setScheduleModalOpen(false)
  }

  const generateSchedule = async () => {
    try {
      const schedule = await ScheduleService.generateDefenseSchedule({
        defenseSlots: defSlots
      })
      setDefenseSchedule(schedule)
      if (schedule.tentativeSchedule) {
        const calendar = defSlotCalendarRef.current.getApi()
        calendar.gotoDate(schedule.tentativeSchedule[0].start)
      }
    } catch (error) {

    }
  }

  const load = async () => {
    try {
      const scheduleList = await ScheduleService.getDefenseSchedule()
      setSchedule(scheduleList)
    } catch (error) {

    }
  }

  const onDefenseSlotCalendarClick = selectInfo => {
    const api = selectInfo.view.calendar
    const { start, end } = selectInfo

    api.unselect()
    if (start.getTime() < Date.now()) {
      alert('Cannot create event in the past')
    } else {
      appendDefSlot({ id: counter, start, end, title: 'Defense' })
      setCounter(prev => prev + 1)
    }
  }

  const onDefenseSlotEventClick = eventInfo => {
    const { event } = eventInfo
    setDefSlots(prev => prev.filter(e => e.id.toString() !== event.id ))
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <Helmet>
        <meta charSet='utf-8' />
        <meta name='Defense Week' content='width=device-width, initial-scale=1.0' />
        <title>Defense Week</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column'>
          {
            canScheduleDefense && <>
              <Modal isOpen={defSlotInfoModalOpen} fade={false} centered scrollable>
                <ModalHeader>Edit defense schedule slot</ModalHeader>
                <ModalBody>

                </ModalBody>
                <ModalFooter>
                  <Button onClick={() => {}}>Apply</Button>
                  <Button onClick={() => setDefSlotInfoModalOpen(false)}>Close</Button>
                </ModalFooter>
              </Modal>
              <Modal isOpen={scheduleModalOpen} fade={false} centered scrollable size='lg'>
                <ModalHeader>Create defense schedule</ModalHeader>
                <ModalBody>
                  {
                    defenseSchedule ? <>
                      <FullCalendar
                        contentHeight='50vh'
                        plugins={[timeGridPlugin, interactionPlugin]}
                        allDaySlot={false}
                        editable
                        selectable
                        ref={defSlotCalendarRef}
                        events={defenseSchedule ? (defenseSchedule.tentativeSchedule || []) : []} />
                    </> : <>
                      <p>
                        The scheduler generates a defense schedule for you.
                        Click and drag on the time view calendar to create a new defense slot.
                      </p>
                      <FullCalendar
                        contentHeight='50vh'
                        plugins={[timeGridPlugin, interactionPlugin]}
                        allDaySlot={false}
                        editable
                        selectable
                        select={onDefenseSlotCalendarClick}
                        slotEventOverlap={false}
                        expandRows
                        events={defSlots}
                        eventClick={onDefenseSlotEventClick}
                        nowIndicator
                        eventDisplay='list-item'
                      />
                      <Button onClick={generateSchedule}>Generate</Button>
                    </>
                  }
                  { formError && <Alert color='danger'>{formError}</Alert> }
                </ModalBody>
                <ModalFooter>
                  <Button>Apply</Button>
                  <Button onClick={closeModal}>Close</Button>
                </ModalFooter>
              </Modal>
            </>
          }
          <div className='tm-group'>
            <h2 className='tm-group-name'>Defense Week</h2>
            { canScheduleDefense && <Button onClick={openModal}>Create defense schedule</Button> }
            <Calendar year={year} month={month} onChange={onChange} schedules={schedule} />
          </div>
        </div>
      </div>
    </>
  )
}

export default DefensePage
