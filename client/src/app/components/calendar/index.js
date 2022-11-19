import { Button, Col, Row } from "reactstrap"

const monthsOfYear = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
]
const daysOfWeek = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
]
const daysOfWeekShort = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
]

// events: [{ period: {from,to}, time: {from,to}, repeat }]

function Calendar(props) {
  const { year, month, firstDayOfWeek, onChange, events } = props

  const now = new Date()
  const currentFirstDayOfWeek = firstDayOfWeek || 0
  const currentYear = year === undefined || year === null ? now.getFullYear() : year
  const currentMonth = month === undefined || month === null ? now.getMonth() : month

  const getFirstDayOfCalendar = (year, month) => {
    const date = new Date()
    date.setUTCFullYear(year)
    date.setUTCMonth(month, 1)
    date.setUTCHours(0, 0, 0, 0)
    return date
  }

  const getFirstDayOfCalendarView = (year, month, firstDayOfWeek) => {
    const date = getFirstDayOfCalendar(year, month)
    let dateOffset = date.getDay() - firstDayOfWeek
    if (dateOffset < 0) dateOffset += 7

    date.setTime(date.getTime() - dateOffset * 86400 * 1000)
    return date
  }

  const getDayInCalendar = (firstDay, row, column) => {
    const tmp = new Date(firstDay.getTime())
    
    tmp.setTime(tmp.getTime() + 86400 * 1000 * (row * 7 + column))
    return {
      datetime: tmp,
      date: tmp.getDate(),
      day: tmp.getDay(),
      highlight: tmp.getUTCFullYear() === currentYear && tmp.getUTCMonth() === currentMonth
    }
  }

  const firstDayView = getFirstDayOfCalendarView(currentYear, currentMonth, currentFirstDayOfWeek)

  const doChangeOffset = (monthOffset) => () => {
    const date = getFirstDayOfCalendar(currentYear, currentMonth)
    if (monthOffset < 0) {
      while (monthOffset++ < 0) {
        date.setUTCDate(0)
        date.setUTCDate(1)
      }
    } else if (monthOffset > 0) {
      while (monthOffset-- > 0) {
        date.setUTCDate(1)
        date.setUTCMonth(date.getUTCMonth() + 1)
      }
    }

    if (onChange) onChange(date.getUTCFullYear(), date.getUTCMonth())
  }

  const eventIsWithinPeriod = (date, event) => {
    const start = new Date(event.startPeriod)
    const end = new Date(event.endPeriod || event.startPeriod)
    end.setTime(end.getTime() + 86400 * 1000 - 1)

    const { datetime } = date
    console.log(`${start.getTime()}, ${datetime.getTime()}, ${end.getTime()}`)
    
    return start.getTime() <= datetime.getTime() && datetime.getTime() <= end.getTime()
  }

  const eventRepeatsOnThisDay = (date, event) => {
    const day = date.day.toString()
    return event.repeating && event.repeat.includes(day)
  }

  const eventOccursOnDay = (date, event) => {
    return eventIsWithinPeriod(date, event) && (!event.repeating || eventRepeatsOnThisDay(date, event))
  }

  const getEventsOfDate = (date) => {
    return events ? events.filter(e => eventOccursOnDay(date, e)).sort((a, b) => {
      const da = new Date(a.startPeriod)
      const db = new Date(b.startPeriod)
      return da.getTime() - db.getTime()
    }) : []
  }

  return (
    <>
      <Row className='border'>
        <Col className='text-start'>
          <Button onClick={doChangeOffset(-1)}>{'<<'}</Button>
        </Col>
        <Col className='text-center'>
          {monthsOfYear[currentMonth]} {currentYear}
        </Col>
        <Col className='text-end'>
          <Button onClick={doChangeOffset(1)}>{'>>'}</Button>
        </Col>
      </Row>
      <Row>
        {
          [0,1,2,3,4,5,6].map(day => {
            const dayOfWeek = (day + currentFirstDayOfWeek) % 7
            return <Col className='border'>
              <span>{daysOfWeekShort[dayOfWeek]}</span>
            </Col>
          })
        }
      </Row>
      {
        [0,1,2,3,4,5].map(row => (
          <Row>
            {
              [0,1,2,3,4,5,6].map(column => {
                const entry = getDayInCalendar(firstDayView, row, column)
                const events = getEventsOfDate(entry)
                return <Col className='border'>
                  <div className={entry.highlight ? '' : 'text-secondary text-opacity-25'}>
                    <div>
                      {entry.date}
                    </div>
                    {
                      events.map(e => (<div>{e.name}</div>))
                    }
                  </div>
                </Col>
              })
            }
          </Row>
        ))
      }
    </>
  )
}

export default Calendar
export { daysOfWeek, daysOfWeekShort }
