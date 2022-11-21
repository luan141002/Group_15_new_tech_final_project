import { useEffect, useState } from "react"
import ScheduleService from "../../services/ScheduleService"
import Calendar from "../calendar"

function ViewCalendarSection() {
  const currentDate = new Date()
  const [schedules, setSchedules] = useState([])
  const [year, setYear] = useState(currentDate.getFullYear())
  const [month, setMonth] = useState(currentDate.getMonth())

  const onChange = (year, month) => {
    setYear(year)
    setMonth(month)
  }

  const onClickEvent = (scheduleId) => {
    const schedule = schedules.find(e => e.id === scheduleId)
  }

  const load = async() => {
    try {
      const scheduleList = await ScheduleService.getSchedules()
      setSchedules(scheduleList)
    } catch (error) {

    }
  }
  
  useEffect(() => {
    load()
  }, [])

  return (
    <>
      <div className='tm-group'>
        <h2 className="tm-group-name">Calendar</h2>
        <Calendar year={year} month={month} onChange={onChange} events={schedules} onClickEvent={onClickEvent} />
      </div>
    </>
  )
}

export default ViewCalendarSection
