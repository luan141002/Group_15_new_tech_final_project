import dayjs from "dayjs";
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import Button from "react-bootstrap/esm/Button";
import ThesisService from "../services/ThesisService";
import { Download } from "react-bootstrap-icons";
import renderName from '../utility/renderName';

function ThesisView(props) {
  const { thesis } = props;

  const findMember = (thesis, submitterID, mode) => {
    let table;
    switch (mode) {
      case 'adviser': table = thesis.advisers; break;
      default: table = thesis.authors; break;
    }

    return table.find(e => e._id === submitterID);
  };

  const downloadFile = async (sid, attachment) => {
    const { originalName: name, _id: id } = attachment;
    const blob = await ThesisService.getAttachment(thesis._id, sid, id);
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  };

  return thesis ? (
    <>
      <Row>
        <Col sm={9}>
          <h3>{thesis.title}</h3>
          <h6 className='text-muted'>by {thesis.authors.map(renderName).join('; ')}</h6>
          <h6 className='text-muted'>advised by {thesis.advisers.map(renderName).join('; ')}</h6>
          <p>{thesis.description}</p>
          {
            (thesis.submissions && thesis.submissions.length > 0) &&
              <>
                <h5>Attachments</h5>
                <h6 className='text-muted'>Last updated on {dayjs(thesis.submissions[0].submitted).format('LLL')}</h6>
                <ul>
                  {
                    thesis.submissions[0].attachments.map(e => (
                      <li>
                        {/*<Link to={`/thesis/${thesis._id}/submission/${thesis.submissions[0]._id}/attachment/${e._id}`}>
                        </Link>
                        <Button as='a' className='ms-2' bsPrefix='__' onClick={() => downloadFile(thesis.submissions[0]._id, e)}>
                          <Download />
                        </Button>*/}
                        <Button as='a' bsPrefix='__' onClick={() => downloadFile(thesis.submissions[0]._id, e)}>
                          {e.originalName}
                        </Button>
                        <Button as='a' className='ms-2' bsPrefix='__' onClick={() => downloadFile(thesis.submissions[0]._id, e)}>
                          <Download />
                        </Button>
                      </li>
                    ))
                  }
                </ul>
              </>
          }
        </Col>
        <Col sm={3}>
          <div>
            <LinkContainer to={`/thesis/${thesis._id}/edit`}>
              <Button>Edit</Button>
            </LinkContainer>
          </div>
          <Card style={{ width: '18rem' }} className='mt-2'>
            <Card.Body>
              <Card.Text>
                <h4>Remarks</h4>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam molestie justo at finibus venenatis.
                  Donec mi augue, sagittis eget accumsan ut, malesuada sed dolor.
                </p>
                <h4>Status</h4>
                <p>For checking</p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
    </>
  ) : null;
}

export default ThesisView;
