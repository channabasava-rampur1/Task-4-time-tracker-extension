// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar(){
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
        <Link className="navbar-brand" to="/">Time Tracker</Link>

        <div>
          {!token ? (
            <>
              <Link className="btn btn-outline-primary me-2" to="/login">Login</Link>
              <Link className="btn btn-outline-success" to="/register">Register</Link>
            </>
          ) : (
            <button className="btn btn-danger" onClick={logout}>Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
}
