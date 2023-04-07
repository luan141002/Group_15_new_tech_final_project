import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { AsyncTypeahead, Highlighter, Menu, MenuItem } from 'react-bootstrap-typeahead';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import DefenseCalendar from '../../components/DefenseCalendar';
import DefenseSummaryDialog from '../../components/DefenseSummaryDialog';
import ProfileImage from '../../components/ProfileImage';
import AccountService from '../../services/AccountService';
import DefenseService from '../../services/DefenseService';
import SearchService from '../../services/SearchService';
import ThesisService from '../../services/ThesisService';

function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [theses, setTheses] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchSelected, setSearchSelected] = useState([]);
  const [defenses, setDefenses] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const load = async () => {
    setAccounts(await AccountService.getAccounts());
    setTheses(await ThesisService.getTheses({ all: true, showPending: 'all' }));
    setDefenses(await DefenseService.getDefenses());
  };

  useEffect(() => {
    load();
  }, []);

  const handleSearch = async (q) => {
    q = q.trim();
    if (q.length < 2) return;

    setSearchLoading(true);
    const options = await SearchService.search(q);
    setSearchOptions(options);
    setSearchLoading(false);
  };

  const handleOption = (option) => {
    const value = option.value;
    switch (option.type) {
      case 'thesis':
        navigate(`/thesis/${value._id}`);
        break;
      case 'account':
        navigate(`/account/${value._id}`);
        break;
      default:
        break;
    }
    setSearchSelected([]);
  };

  const handleResult = () => {
    if (searchSelected.length > 0) {
      const option = searchSelected[0];
      handleOption(option);
    }
  }

  const handleSearchKey = (e) => {
    if (e.isComposing || e.keyCode === 229) return;

    if (e.keyCode === 13) {
      handleResult();
    }
  };

  const renderSearchMenu = (
    results,
    {
      newSelectionPrefix,
      paginationText,
      renderMenuItemChildren,
      ...menuProps
    },
    state
  ) => {
    if (!results || results.length === 0) {
      return <></>;
    }

    let index = 0;
    const items = results.map(e => {
      if (e.type === 'thesis') {
        const thesis = e.value;
        const item = (
          <MenuItem key={`thesis-${thesis._id}`} option={e} position={index}>
            <Highlighter search={state.name}>{thesis.title}</Highlighter>
            <div>
              <small>{thesis.authors.map(e => t('values.full_name', e)).join('; ')}</small>
            </div>
          </MenuItem>
        );
  
        index += 1;
        return item;
      } else if (e.type === 'account') {
        const account = e.value;
        const item = (
          <MenuItem key={`account-${account._id}`} option={e} position={index}>
            <ProfileImage 
              width={30}
              roundedCircle
              accountID={account._id}
              alt={t('values.full_name', account)}
              className='me-2'
            />
            <Highlighter search={state.name}>{t('values.full_name', account)}</Highlighter>
          </MenuItem>
        );
  
        index += 1;
        return item;
      } else {
        return <></>;
      }
    });
    return <Menu {...menuProps}>{items}</Menu>
  };

  return (
    <>
      <Row className='mb-4'>
        <Form className="d-flex w-100">
          <AsyncTypeahead
            id='formSearch'
            className="me-2 w-100"
            filterBy={() => true}
            isLoading={searchLoading}
            labelKey='key'
            renderMenu={renderSearchMenu}
            onSearch={handleSearch}
            options={searchOptions}
            aria-label="Search"
            placeholder="Search thesis, account..."
            selected={searchSelected}
            onChange={setSearchSelected}
            onKeyDown={handleSearchKey}
            selectHint={false}
          />
          <Button variant="outline-success" onClick={handleResult}>Search</Button>
        </Form>
      </Row>
      <Row className='mb-4'>
        <Col>
          <Card>
            <Card.Body>
              <Card.Text className='text-center'>
                <h2>{theses.filter(e => e.approved && e.status !== 'final').length}</h2>
                <p><Link to='/thesis' className='stretched-link'>active theses</Link></p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Card.Text className='text-center'>
                <h2>{theses.filter(e => e.approved === false).length}</h2>
                <p><Link to='/thesis?showPending=show' className='stretched-link'>active theses requests</Link></p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Card.Text className='text-center'>
                <h2>{accounts.filter(e => !e.locked).length}</h2>
                <p><Link to='/account' className='stretched-link'>active accounts</Link></p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Body>
              <Card.Text className='text-center'>
                <h2>{defenses.filter(e => e.status === 'approved').length}</h2>
                <p><Link to='/defense' className='stretched-link'>active defense requests</Link></p>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Text className='text-center'>
                <DefenseCalendar defenses={defenses.filter(e => e.status === 'confirmed')} onEventClick={e => setSelectedEvent(e)} />
                <DefenseSummaryDialog show={!!selectedEvent} defense={selectedEvent} onClose={() => setSelectedEvent(null)} />
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default DashboardPage;
