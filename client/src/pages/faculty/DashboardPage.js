import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { X } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import { LinkContainer } from 'react-router-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import dayjs from 'dayjs';
import ThesisTable from '../../components/ThesisTable';
import AnnouncementService from '../../services/AnnouncementService';
import DefenseService from '../../services/DefenseService';
import ThesisService from '../../services/ThesisService';

function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [theses, setTheses] = useState([]);
  const [announcements, setAnnouncements] = useState({ items: [] });
  const [defenses, setDefenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const thesesToCheck = theses.filter(e => e.status === 'for_checking');
  const thesesByPhase = theses.reduce((p, e) => {
    const array = p.find(e2 => e2.phase === e.phase);
    if (array) {
      array.values.push(e);
    } else {
      p.push({
        phase: e.phase,
        values: [e]
      });
    }

    return p;
  }, []);
  thesesByPhase.sort((a, b) => a.phase - b.phase);

  const onLoad = async () => {
    try {
      setLoading(true);
      setAnnouncements(await AnnouncementService.getAnnouncements());
      setTheses(await ThesisService.getTheses());
      setDefenses(await DefenseService.getDefenses());
    } finally {
      setLoading(false);
    }
  };

  const dismissAnnouncement = id => {
    setAnnouncements(prev => {
      const { items, ...rest } = prev;
      return {
        items: items.filter(e => e._id !== id),
        ...rest
      }
    });
  };

  useEffect(() => {
    onLoad();
  }, []);

  return (
    <>
      <Row>
        <Col sm={8}>
          {
            announcements.items && announcements.items.length > 0 &&
              <Card className='mb-4'>
                <Card.Body>
                  <Card.Title>Announcements</Card.Title>
                  <Card.Text>
                    {
                      announcements.items.map(e => (
                        <>
                          <hr />
                          <div className='clearfix'>
                            <h4 className='float-start'>{e.title}</h4>
                            <Button variant='light' className='float-end' onClick={() => dismissAnnouncement(e._id)}>
                              <span style={{ verticalAlign: 'super' }}><X /></span>
                            </Button>
                          </div>
                          <h6 className='text-muted'>{dayjs(e.sent).format('LLL')}</h6>
                          <p>{e.text}</p>
                        </>
                      ))
                    }
                  </Card.Text>
                </Card.Body>
              </Card>
          }
          <Card className='mb-4'>
            <Card.Body>
              <Card.Title>Theses to be checked</Card.Title>
              <Card.Text>
                {
                  thesesToCheck.length > 0 ?
                    <ThesisTable
                      theses={thesesToCheck}
                      filter={false}
                      pagination={false}
                    />
                    :
                    <p>None to check.</p>
                }
              </Card.Text>
            </Card.Body>
          </Card>
          <Card className='mb-4'>
            <Card.Body>
              <Card.Text className='text-center'>
                <FullCalendar
                  plugins={[ dayGridPlugin ]}
                  initialView='dayGridMonth'
                  selectable
                  expandRows
                  height='65vh'
                  headerToolbar={{
                    start: 'today,prev,next',
                    center: 'title',
                    end: 'gotoPage'
                  }}
                  events={defenses}
                  customButtons={{
                    gotoPage: {
                      text: 'Go to page',
                      click: () => {
                        navigate('/defense');
                      }
                    }
                  }}
                />
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={4}>
          <Card>
            <Card.Body>
              <Card.Title>My thesis groups</Card.Title>
              <Card.Text>
                {
                  thesesByPhase.map(({ phase, values }) => (
                    <>
                      <h6>{t(`values.thesis_phase.${phase}`)} phase</h6>
                      <ul>
                        {
                          values.map(e => (
                            <li>
                              <Link to={`/thesis/${e._id}`}>{e.title}</Link>
                            </li>
                          ))
                        }
                      </ul>
                    </>
                  ))
                }
              </Card.Text>
              <LinkContainer to='/thesis'>
                <Button>View all</Button>
              </LinkContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default DashboardPage;