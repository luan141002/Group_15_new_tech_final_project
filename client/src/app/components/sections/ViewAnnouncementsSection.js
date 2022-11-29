import dayjs from "dayjs"
import { useEffect, useState } from "react"
import { Card, CardBody, CardSubtitle, CardText, CardTitle } from 'reactstrap'
import AnnouncementService from "../../services/AnnouncementService"

function ViewAnnouncementsSection() {
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
                <CardSubtitle>{dayjs(e.uploadDate).format('lll')}</CardSubtitle>
                <CardText>{e.message}</CardText>
              </CardBody>
            </Card>
          ))
        }
      </div>
    </>
  ) : <></>
}

export default ViewAnnouncementsSection
