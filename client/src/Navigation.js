import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';

const Navigation = ({ token, onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Cleanup function for the effect
    return () => {
      // Make sure to remove any event listeners or perform any cleanup when the component unmounts
      // ...
    };
  }, []);

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
      navigate('/'); // Redirect to the "/" page after logout
    }
  };

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/">
        WordRecall
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="navbarNav" />
      <Navbar.Collapse id="navbarNav">
        <Nav className="mr-auto">
          {token && (
            <>
              <Nav.Link as={Link} to="/learning">
                Study New Words
              </Nav.Link>
              <Nav.Link as={Link} to="/repetition">
                Repeat Learned Words
              </Nav.Link>
              <Nav.Link as={Link} to="/repetition-reverse">
                Repeat Learned Words Reversed
              </Nav.Link>
              <Nav.Link as={Link} to="/csv">
                Save learned words to CSV
              </Nav.Link>
            </>
          )}
        </Nav>
        {token && (
          <Nav>
            <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
          </Nav>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Navigation;
