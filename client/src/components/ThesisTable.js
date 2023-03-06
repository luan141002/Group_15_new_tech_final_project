import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import { DatatableWrapper, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import { useTranslation } from 'react-i18next';
import ThesisService from '../services/ThesisService';

const getColumns = ({ t, hasActions }) => {
  return [
    {
      title: 'Title',
      prop: 'title'
    },
    {
      title: 'Last submitted',
      prop: 'lastSubmitted',
      cell: (row) => dayjs(row.submission.when).format('LLL')
    },
    {
      title: 'Status',
      prop: 'status',
      cell: (row) => {
        <td>{t(`values.thesis_status.${row.status}`)}</td>
      }
    },
    {
      title: 'Actions',
      prop: 'actions',
      cell: (row) => {
        return;
      }
    }
  ];
};

function ThesisTable(props) {
  const { t } = useTranslation();
  const { theses, header, footer } = props;
  const [thesesInternal, setThesesInternal] = useState([]);
  const columns = getColumns({ t });

  const thesisList = theses || thesesInternal;

  const load = async () => {
    try {
      const list = await ThesisService.getTheses({ hasSubmission: true });
      setThesesInternal(list);
    } catch (error) {

    } finally {

    }
  };

  useEffect(() => {
    if (!theses) {
      load();
    } else {
      setThesesInternal([]);
    }
  }, [theses]);

  return (
    <>
      <DatatableWrapper
        body={thesisList}
        headers={columns}
        paginationOptionsProps={{
          initialState: {
            rowsPerPage: 15,
            options: [5, 10, 15, 20, 50, 100]
          }
        }}
      >
        <Row className='mb-2'>
          {header}
        </Row>
        <Table striped hover size="sm">
          <TableHeader />
          <TableBody />
        </Table>
        <Row>
          <Col className='d-flex flex-col justify-content-start align-items-end mb-2 mb-sm-0'>
            <PaginationOptions />
          </Col>
          <Col className='d-flex flex-col justify-content-end align-items-end'>
            <Pagination />
          </Col>
        </Row>
      </DatatableWrapper>
    </>
  );
}

export default ThesisTable;
