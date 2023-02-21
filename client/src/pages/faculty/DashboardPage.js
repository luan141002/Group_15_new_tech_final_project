import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import { Link } from 'react-router-dom';
import ThesisService from '../../services/ThesisService';

function DashboardPage() {
  const [theses, setTheses] = useState([]);

  const onLoad = async () => {
    setTheses(await ThesisService.getTheses({ hasSubmission: true }));
  };

  useEffect(() => {
    onLoad();
  }, []);

  return (
    <>
      <h3>My groups</h3>
      <Table striped="columns">
        <thead>
          <tr>
            <th>Thesis</th>
            <th>Last submitted</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {
            theses.map(e => (
              <tr>
                <td><Link to={`/thesis/${e._id}`}>{e.title}</Link></td>
                <td><Link to={`/thesis/${e._id}/submission/${e.submission.latest}`}>{dayjs(e.submission.when).format('LLL')}</Link></td>
                <td>For checking</td>
              </tr>
            ))
          }
        </tbody>
      </Table>
    </>
  );
}

export default DashboardPage;
