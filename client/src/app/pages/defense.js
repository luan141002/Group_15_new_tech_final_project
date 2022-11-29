import { useEffect, useRef, useState } from "react"
import { Helmet } from "react-helmet"
import ScheduleService from "../services/ScheduleService"
import GroupService from "../services/GroupService"
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

function DefensePage() {
  const [groups, setGroups] = useState([])
  const [schedule, setSchedule] = useState([])
  const calref = useRef()

  const getGroupName = (id) => {
    const group = groups.find(e => e.id === id)
    return group ? group.name : 'unknown group'
  }

  const load = async () => {
    try {
      const groupsList = await GroupService.getAllGroups()
      setGroups(groupsList)
      const scheduleList = await ScheduleService.getDefenseSchedule()
      scheduleList.sort((a, b) => new Date(`${a.startPeriod}T${a.startTime}:00`).getTime() - new Date(`${b.startPeriod}T${b.startTime}:00`).getTime())
      setSchedule(scheduleList)
      const calendar = calref.current.getApi()
      const first = scheduleList[0]
      calendar.gotoDate(new Date(`${first.startPeriod}T${first.startTime}:00`))
    } catch (error) {

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
          <div className='tm-group'>
            <h2 className='tm-group-name'>Defense Week</h2>
            <FullCalendar
              contentHeight='60vh'
              plugins={[dayGridPlugin]}
              selectable
              ref={calref}
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
