import { useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet"
import { Alert, Button, Input, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap"
import { checkAccount, useAccount } from "../../providers/account"
import ScheduleService from "../../services/ScheduleService"
import GroupService from "../../services/GroupService"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import { clone, cloneDeep } from "lodash"

function DefensePage() {
  const { account } = useAccount()
  const canScheduleDefense = checkAccount(account, 'faculty.coordinator')

  const [counter, setCounter] = useState(0)
  const [groups, setGroups] = useState([])
  const [schedule, setSchedule] = useState([])
  const [defenseSchedule, setDefenseSchedule] = useState(null)
  const [tentativeSchedule, setTentativeSchedule] = useState([])
  const [useGenerated, setUseGenerated] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState('')
  const defenseCalendarRef = useRef(null)
  const defSlotCalendarRef = useRef(null)

  const [defSlots, setDefSlots] = useState([])
  const [defSlotInfoModalOpen, setDefSlotInfoModalOpen] = useState(false)

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [notAllGroupsWarningOpen, setNotAllGroupsWarningOpen] = useState(false)
  const [formError, setFormError] = useState('')

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
    setNotAllGroupsWarningOpen(false)
    setDefenseSchedule(null)
    setTentativeSchedule([])
    setScheduleModalOpen(false)
  }

  const isSlotAssigned = (id) => tentativeSchedule.findIndex(e => e.id === id) !== -1
  const isGroupAssigned = (id) => tentativeSchedule.findIndex(e => e.group === id) !== -1
  const getGroupName = (id) => {
    const group = groups.find(e => e.id === id)
    return group ? group.name : 'unknown group'
  }

  const applySchedule = async () => {
    try {
      await ScheduleService.applyDefenseSchedule(tentativeSchedule.map(e => {
        const start = e.start
        return {
          group: e.group,
          date: `${start.getFullYear()}-${(start.getMonth() + 1).toString().padStart(2, '0')}-${start.getDate().toString().padStart(2, '0')}`,
          start: `${e.start.getHours()}:${e.start.getMinutes()}`,
          end: `${e.end.getHours()}:${e.end.getMinutes()}`
        }
      }))
      await load()
      closeModal()
    } catch (error) {
      setFormError(error.message)
    }
  }

  const tryApplySchedule = async () => {
    if (groups.every(e => isGroupAssigned(e.id))) {
      await applySchedule()
    } else {
      setNotAllGroupsWarningOpen(true)
    }
  }

  const generateSchedule = async () => {
    try {
      setFormError('')
      if (defSlots.length < 1) {
        throw { message: 'There must be at least one defense slot.' }
      }

      const schedule = await ScheduleService.generateDefenseSchedule({
        defenseSlots: defSlots
      })
      setDefenseSchedule(schedule)
      if (schedule.tentativeSchedule) {
        setUseGenerated(true)
        setTentativeSchedule(schedule.tentativeSchedule)
        const calendar = defSlotCalendarRef.current.getApi()
        calendar.gotoDate(schedule.tentativeSchedule[0].start)
      }
    } catch (error) {
      setFormError(error.message)
    }
  }

  const load = async () => {
    try {
      const groupsList = await GroupService.getAllGroups()
      setGroups(groupsList)
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

  const isAssigning = () => !useGenerated && !!selectedGroup

  const onDefenseCreatorEventClick = eventInfo => {
    if (isAssigning()) {
      const { event } = eventInfo
      const groupSelected = selectedGroup
      try {
        setTentativeSchedule(prev => {
          const next = cloneDeep(prev)
  
          const group = groups.find(e => e.id === groupSelected)
          if (!group) return next
  
          next.push({
            id: Number.parseInt(event.id),
            start: event.start,
            end: event.end,
            title: group.name,
            group: groupSelected
          })
          return next
        })
        setSelectedGroup('')
      } catch (error) {

      }
    } else if (!useGenerated) {
      const { event } = eventInfo
      setTentativeSchedule(prev => {
        let next = cloneDeep(prev)
        next = next.filter(e => e.group !== event.extendedProps.group)
        return next
      })
    }
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
              <Modal isOpen={notAllGroupsWarningOpen} fade={false} centered scrollable>
                <ModalHeader>Warning</ModalHeader>
                <ModalBody>
                  <p>Not all groups are assigned. Continue anyway?</p>
                </ModalBody>
                <ModalFooter>
                  <Button onClick={applySchedule}>Yes</Button>
                  <Button onClick={() => setNotAllGroupsWarningOpen(false)}>No</Button>
                </ModalFooter>
              </Modal>
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
                    (defenseSchedule && tentativeSchedule) ? <>
                      { formError && <Alert color='danger'>{formError}</Alert> }
                      {
                        (!useGenerated && defenseSchedule) && <>
                          <Input type='select' placeholder='Add member' value={selectedGroup} onChange={(event) => setSelectedGroup(event.target.value)}>
                            <option value=''>--- Select group to assign ---</option>
                            {
                              groups.filter(e => !isGroupAssigned(e.id)).map(e => (
                                <option key={e.id} value={e.id}>{`${e.name} - (${defenseSchedule.freeSlotsInfo.filter(e2 => e2.free.includes(e.id)).length} slots available)`}</option>
                              ))
                            }
                          </Input>
                        </>
                      }
                      <FullCalendar
                        contentHeight='50vh'
                        plugins={[timeGridPlugin, interactionPlugin]}
                        customButtons={{
                          reset: {
                            text: useGenerated ? 'Make custom' : 'Use generated',
                            click: () => {
                              if (useGenerated) {
                                setTentativeSchedule([])
                                setUseGenerated(false)
                              } else {
                                setTentativeSchedule(defenseSchedule.tentativeSchedule)
                                setUseGenerated(true)
                              }
                            }
                          }
                        }}
                        headerToolbar={{
                          start: 'reset',
                          center: 'title',
                          end: 'today prev,next'
                        }}
                        allDaySlot={false}
                        editable
                        selectable
                        ref={defSlotCalendarRef}
                        eventClick={onDefenseCreatorEventClick}
                        events={isAssigning() ? defSlots.filter(e => {
                          if (isSlotAssigned(e.id)) return false
                          const slot = defenseSchedule.freeSlotsInfo.findIndex(e2 => e2.id === e.id && e2.free.includes(selectedGroup))
                          return slot !== -1
                        }) : tentativeSchedule} />
                    </> : <>
                      <p>
                        The scheduler generates a defense schedule for you.
                        Click and drag on the time view calendar to create a new defense slot.
                      </p>
                      { formError && <Alert color='danger'>{formError}</Alert> }
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
                    </>
                  }
                </ModalBody>
                <ModalFooter>
                  {
                    (defenseSchedule && tentativeSchedule) ? <>
                      <Button onClick={tryApplySchedule}>Apply</Button>
                    </> : <>
                      <Button onClick={generateSchedule}>Generate</Button>
                    </>
                  }
                  <Button onClick={closeModal}>Close</Button>
                </ModalFooter>
              </Modal>
            </>
          }
          <div className='tm-group'>
            <h2 className='tm-group-name'>Defense Week</h2>
            { canScheduleDefense && <Button onClick={openModal}>Create defense schedule</Button> }
            <FullCalendar
              contentHeight='60vh'
              plugins={[dayGridPlugin, interactionPlugin]}
              selectable
              ref={defenseCalendarRef}
              events={schedule ? schedule.map(e => ({
                start: new Date(`${e.startPeriod}T${e.startTime}:00`),
                end: new Date(`${e.startPeriod}T${e.startTime}:00`),
                title: `${getGroupName(e.group)} Defense`
              })) : []} />
          </div>
        </div>
      </div>
    </>
  )
}

export default DefensePage
