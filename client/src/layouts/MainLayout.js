import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Navbar from 'react-bootstrap/Navbar';
import { LinkContainer } from 'react-router-bootstrap';
import { Outlet, useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { AsyncTypeahead, Highlighter, Menu, MenuItem } from 'react-bootstrap-typeahead';
import { useState } from 'react';
import ThesisService from '../services/ThesisService';
import SearchService from '../services/SearchService';

function MainLayout() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await AuthService.logout();
    navigate('/auth/login');
  };

  const handleSearch = async (q) => {
    q = q.trim();
    if (q.length < 2) return;

    setLoading(true);
    const options = await SearchService.search(q);
    setOptions(options);
    setLoading(false);
  };

  const handleOption = (option) => {
    navigate(`/thesis/${option._id}`);
    setSelected([]);
  };

  const handleSearchKey = (e) => {
    if (e.isComposing || e.keyCode === 229) return;

    if (e.keyCode === 13) {
      if (selected.length > 0) {
        const option = selected[0];
        handleOption(option);
      }
    }
  };

  const renderName = (person) => `${person.lastName}, ${person.firstName}`;

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
      return (
        <Menu {...menuProps}>
          <Menu.Header>Test</Menu.Header>
          <MenuItem position={0}>
            ABC
          </MenuItem>
        </Menu>
      );
    }

    let index = 0;
    const items = results.map(e => {
      if (e.type === 'thesis') {
        const thesis = e.value;
        const item = (
          <MenuItem key={thesis._id} option={thesis} position={index}>
            <Highlighter search={state.name}>{thesis.title}</Highlighter>
            <div>
              <small>{thesis.authors.map(renderName).join('; ')}</small>
            </div>
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
      <Navbar bg="light" expand="lg">
        <Container>
          <LinkContainer to='/'>
            <Navbar.Brand>Thesis Management System</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link>Home</Nav.Link>
            </Nav>
          </Navbar.Collapse>
          <Navbar.Collapse className="justify-content-end w-100">
            <Form className="d-flex ms-auto w-100">
              <AsyncTypeahead
                id='formSearch'
                className="mx-2 w-100"
                filterBy={() => true}
                isLoading={loading}
                labelKey='title'
                renderMenu={renderSearchMenu}
                onSearch={handleSearch}
                options={options}
                aria-label="Search"
                placeholder="Search..."
                selected={selected}
                onChange={setSelected}
                onKeyDown={handleSearchKey}
                selectHint={false}
              />
              <Button variant="outline-success">Search</Button>
            </Form>
            <Nav className="ms-3">
              <NavDropdown title="Account" id="account-dropdown">
                <LinkContainer to='/settings'>
                  <NavDropdown.Item>Settings</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Sign out</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className='my-3'>
        <Outlet />
      </Container>
    </>
  );
}

export default MainLayout;
