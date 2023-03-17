import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import { useTranslation } from 'react-i18next';
import ThesisService from '../services/ThesisService';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';

const getColumns = ({ t, hasActions }) => {
  const cols = [
    {
      title: 'Title',
      prop: 'title',
      isFilterable: true,
      cell: (row) => (
        <Link to={`/thesis/${row._id}`}>{row.title}</Link>
      )
    },
    {
      title: 'Last submitted',
      prop: 'lastSubmitted',
      cell: (row) => row.submission ? dayjs(row.submission.when).format('LLL') : 'No submission'
    },
    {
      title: 'Phase',
      prop: 'phase',
      cell: (row) => {
        return <>{t(`values.thesis_phase.${row.phase}`)}</>
      }
    },
    {
      title: 'Status',
      prop: 'status',
      cell: (row) => {
        return <>{t(`values.thesis_status.${row.status}`)}</>
      }
    }
  ];

  if (hasActions) {
    cols.push({
      title: 'Actions',
      prop: 'actions',
      cell: (row) => {
        return;
      }
    });
  }

  return cols;
};

function ThesisTable(props) {
  const { t } = useTranslation();
  const { theses, header, footer, all, filter, pagination, status } = props;
  const [thesesInternal, setThesesInternal] = useState([]);
  const columns = getColumns({ t });
  const [statusInternal, setStatusInternal] = useState(undefined);
  const [phase, setPhase] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const thesisList = theses || thesesInternal;

  const load = async () => {
    try {
      setLoading(true);
      const opts = {};
      if (all) opts.all = true;
      if (status) opts.status = status;
      if (phase) opts.phase = phase;
      const list = await ThesisService.getTheses(opts);
      setThesesInternal(list);
    } catch (error) {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!theses) {
      load();
    } else {
      setThesesInternal([]);
    }
  }, [theses]);

  useEffect(() => {
    if (!theses) {
      load();
    }
  }, [all]);

  const defaultHeader = () => (
    <Row className='mb-2'>
      <Col className='d-flex flex-col justify-content-start align-items-end mb-2 mb-sm-0'>
        { filter && <Filter /> }
      </Col>
      <Col className='d-flex flex-col justify-content-end align-items-end'>
        
      </Col>
    </Row>
  );

  const defaultFooter = () => (
    <Row>
      <Col className='d-flex flex-col justify-content-start align-items-end mb-2 mb-sm-0'>
        { pagination && <PaginationOptions /> }
      </Col>
      <Col className='d-flex flex-col justify-content-end align-items-end'>
        { pagination && <Pagination /> }
      </Col>
    </Row>
  );

  return (
    <>
      <DatatableWrapper
        body={loading ? [] : thesisList}
        headers={columns}
        paginationOptionsProps={{
          initialState: {
            rowsPerPage: 15,
            options: [5, 10, 15, 20, 50, 100]
          }
        }}
      >
        {header || defaultHeader()}
        <Table striped hover size="sm">
          <TableHeader />
          <TableBody />
        </Table>
        {footer || defaultFooter()}
      </DatatableWrapper>
    </>
  );
}

export default ThesisTable;
