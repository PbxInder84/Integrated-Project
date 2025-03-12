import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const authLinks = (
    <>
      <li className="nav-item">
        <Link to="/dashboard" className="nav-link px-4 py-2 hover:bg-blue-600 rounded transition duration-300">
          Dashboard
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/upload-resume" className="nav-link px-4 py-2 hover:bg-blue-600 rounded transition duration-300">
          Upload Resume
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/profile" className="nav-link px-4 py-2 hover:bg-blue-600 rounded transition duration-300">
          Profile
        </Link>
      </li>
      {user && user.role === 'admin' && (
        <li className="nav-item">
          <Link to="/admin" className="nav-link px-4 py-2 hover:bg-blue-600 rounded transition duration-300">
            Admin
          </Link>
        </li>
      )}
      <li className="nav-item">
        <button
          onClick={logout}
          className="nav-link px-4 py-2 hover:bg-red-600 rounded transition duration-300"
        >
          Logout
        </button>
      </li>
    </>
  );

  const guestLinks = (
    <>
      <li className="nav-item">
        <Link to="/login" className="nav-link px-4 py-2 hover:bg-blue-600 rounded transition duration-300">
          Login
        </Link>
      </li>
      <li className="nav-item">
        <Link to="/register" className="nav-link px-4 py-2 hover:bg-blue-600 rounded transition duration-300">
          Register
        </Link>
      </li>
    </>
  );

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          CV Analyzer
        </Link>
        <div className="block lg:hidden">
          <button onClick={toggleMenu} className="text-white focus:outline-none">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
            </svg>
          </button>
        </div>
        <ul className={`flex space-x-2 items-center ${isOpen ? 'block' : 'hidden'} lg:flex`}>
          {isAuthenticated ? authLinks : guestLinks}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 