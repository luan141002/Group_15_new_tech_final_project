import FullCalendar from "@fullcalendar/react"
import { useEffect, useState } from "react"
import ScheduleService from "../../services/ScheduleService"
import dayGridPlugin from '@fullcalendar/daygrid'

function ViewCalendarSection(props) {
  const mySchedules = props.schedules
  const showDefensesOnly = props.defense

  const [schedules, setSchedules] = useState([])

  const load = async() => {
    try {
      const scheduleList = await ScheduleService.getSchedules()
      setSchedules(scheduleList)
    } catch (error) {

    }
  }
  
  useEffect(() => {
    if (!mySchedules) load()
  }, [mySchedules])

  const schedulesToRender = mySchedules || schedules

  return schedulesToRender ? (
    <>
      <div className='tm-group'>
        <h2 className="tm-group-name">{ showDefensesOnly ? 'Defense Week' : 'Calendar' }</h2>
        <FullCalendar
          contentHeight='60vh'
          plugins={[dayGridPlugin]}
          selectable
          events={schedulesToRender ? schedulesToRender.filter(e => !showDefensesOnly || e.type === 'defense').map(e => {
            const isDefense = e.type === 'defense'
            const title = isDefense ? 'Defense' : e.name
            if (e.repeating) {
              const obj = {
                daysOfWeek: e.repeat.split('').map(e => Number.parseInt(e)),
                startRecur: new Date(`${e.startPeriod}T00:00:00`),
                endRecur: new Date(`${e.endPeriod}T23:59:59`),
                startTime: e.startTime,
                endTime: e.endTime,
                title
              }
              console.log(obj)
              return obj
            } else {
              return {
                start: new Date(`${e.startPeriod}T${e.startTime}:00`),
                end: new Date(`${e.startPeriod}T${e.startTime}:00`),
                title
              }
            }
          }) : []} />
      </div>
    </>
  ) : <></>
}

export default ViewCalendarSection
