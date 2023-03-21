import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import { Pencil, Trash } from 'react-bootstrap-icons';
import { DatatableWrapper, Filter, Pagination, PaginationOptions, TableBody, TableHeader } from 'react-bs-datatable';
import { useTranslation } from 'react-i18next';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import ProfileImage from '../components/ProfileImage';
import AccountService from '../services/AccountService';

function AccountsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [type, setType] = useState('');
  const [importedAccounts, setImportedAccounts] = useState([]);
  const [importAccountDialogOpen, setImportAccountDialogOpen] = useState(false);
  const [file, setFile] = useState('');

  const load = async () => {
    const accounts = await AccountService.getAccounts(type);
    setAccounts(accounts.map(e => ({
      ...e,
      fullName: t('values.full_name', e)
    })));
  };

  const removeImport = index => {
    setImportedAccounts(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleAddFile = e => {
    const file = e.currentTarget.files[0];
    const fr = new FileReader();
    console.log(file);
    fr.onload = async () => {
      const contents = fr.result;
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(contents);

      const worksheet = workbook.worksheets[0];
      const rowCount = worksheet.rowCount;
      const accounts = [];
      const kind = 'student';
      for (let i = 2; i <= rowCount; i++) {
        const row = worksheet.getRow(i);
        const lastName = row.getCell(1).value;
        const firstName = row.getCell(2).value;
        const email = row.getCell(3).value;
        accounts.push({ lastName, firstName, kind, email });
      }
      setImportedAccounts(accounts);
    };
    fr.readAsArrayBuffer(file);

    setFile('');
  };

  const handleCloseImportModal = () => {
    setImportedAccounts([]);
    setImportAccountDialogOpen(false);
  };

  const handleImportAccounts = async e => {
    e.preventDefault();
    try {
      await AccountService.createAccounts(importedAccounts);
      await load();
      setImportAccountDialogOpen(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <DatatableWrapper
        body={accounts}
        headers={[
          {
            title: '',
            prop: 'photo',
            cell: (row) => (
              <React.Fragment key={`photo-${row._id}`}>
                <ProfileImage
                  roundedCircle
                  width={24}
                  className='ms-1 me-1'
                  accountID={row._id}
                  alt={t('values.full_name', row)}
                />
              </React.Fragment>
            ),
            thProps: {
              style: {
                width: '36px'
              }
            }
          },
          {
            title: 'Name',
            prop: 'fullName',
            isFilterable: true,
            cell: (row) => (
              <>
                <span>{t('values.full_name', row)}</span>
              </>
            )
          },
          {
            title: 'Type',
            prop: 'kind'
          },
          {
            title: 'Actions',
            prop: 'actions',
            cell: (row) => (
              <>
                <LinkContainer to={`/account/${row._id}`}>
                  <Button variant='link' size='sm'><Pencil /></Button>
                </LinkContainer>
              </>
            )
          }
        ]}
        paginationOptionsProps={{
          initialState: {
            rowsPerPage: 15,
            options: [5, 10, 15, 20, 50, 100]
          }
        }}
      >
        <Row className='mb-2'>
          <Col>
            <h3>Accounts</h3>
          </Col>
          <Col className='d-flex flex-column align-items-end'>
            <div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col className='d-flex flex-col justify-content-start align-items-end mb-2 mb-sm-0'>
            <Filter />
          </Col>
          <Col className='d-flex flex-col justify-content-end align-items-end'>
            <Button className='me-2' onClick={() => setImportAccountDialogOpen(true)}>Add accounts from file...</Button>
            <LinkContainer to='/account/new'><Button className='me-2' as='a'>Add account</Button></LinkContainer>
            <Button variant='secondary' onClick={() => navigate(-1)}>Back</Button>
          </Col>
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
      <Modal show={importAccountDialogOpen} size='lg' animation={false} centered scrollable>
        <Modal.Header>
          <Modal.Title>Add accounts from file</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formDocument">
            <Form.Label>Import spreadsheet</Form.Label>
            <Form.Control type="file" value={file} onChange={handleAddFile} accept="text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" />
          </Form.Group>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                importedAccounts.map((e, i) => (
                  <tr>
                    <td>{t('values.full_name', e)}</td>
                    <td>{e.email}</td>
                    <td>{t(`values.account_kind.${e.kind}`)}</td>
                    <td>
                      <Button variant='link' size='sm' onClick={() => removeImport(i)}><Trash /></Button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleImportAccounts}>Add all</Button>
          <Button variant='secondary' onClick={handleCloseImportModal}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default AccountsPage;
