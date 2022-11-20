import { useEffect, useState } from "react"
import { Card, CardBody, CardText, CardTitle } from 'reactstrap'
import AnnouncementService from "../../services/AnnouncementService"

function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState([])

  const load = async() => {
    try {
      const announcementList = await AnnouncementService.getAnnouncements()
      setAnnouncements(announcementList)
    } catch (error) {
      console.log(error)
    }
  }
  
  useEffect(() => {
    load()
  }, [])

  return announcements && announcements.length > 0 ? (
    <>
      <div className='tm-group'>
        <h2 className="tm-group-name">Announcements</h2>
        {
          announcements.map(e => (
            <Card className='mt-2'>
              <CardBody>
                <CardTitle>{e.title}</CardTitle>
                <CardText>{e.message}</CardText>
              </CardBody>
            </Card>
          ))
        }
      </div>
    </>
  ) : <></>
}

export default AnnouncementsSection
