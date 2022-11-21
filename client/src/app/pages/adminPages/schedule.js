import { useEffect } from "react"
import { Helmet } from "react-helmet"
import ScheduleSection from '../../components/sections/ScheduleSection'

function SchedulePage() {
  const load = async () => {
    try {

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
        <meta name='Schedule' content='width=device-width, initial-scale=1.0' />
        <title>Schedule</title>
      </Helmet>
      <div className='tm-row'>
        <div className='tm-column'>
          <ScheduleSection allowedTypes={['personal', 'global']} />
        </div>
      </div>
    </>
  )
}

export default SchedulePage