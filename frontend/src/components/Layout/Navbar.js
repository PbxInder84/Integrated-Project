import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ isAuthenticated, user, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if a link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg' : 'bg-gradient-to-r from-blue-600 to-blue-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo section - Left side */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <div className={`flex items-center transition-all duration-300 ${scrolled ? 'text-blue-600' : 'text-white'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-bold text-xl">
                  Resume<span className={scrolled ? "text-blue-600" : "text-blue-300"}>AI</span>
                </span>
              </div>
            </Link>
          </div>
          
          {/* Navigation and Auth - Right side */}
          <div className="flex items-center">
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive('/dashboard') 
                        ? scrolled 
                          ? 'text-blue-700 font-semibold' 
                          : 'text-white font-semibold'
                        : scrolled 
                          ? 'text-gray-700 hover:text-blue-700' 
                          : 'text-white hover:text-blue-200'
                    }`}
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </span>
                    {isActive('/dashboard') && (
                      <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-1/2 ${scrolled ? 'bg-blue-600' : 'bg-white'} rounded-full`}></span>
                    )}
                  </Link>
                  
                  <Link 
                    to="/upload" 
                    className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive('/upload') 
                        ? scrolled 
                          ? 'text-blue-700 font-semibold' 
                          : 'text-white font-semibold'
                        : scrolled 
                          ? 'text-gray-700 hover:text-blue-700' 
                          : 'text-white hover:text-blue-200'
                    }`}
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload Resume
                    </span>
                    {isActive('/upload') && (
                      <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-1/2 ${scrolled ? 'bg-blue-600' : 'bg-white'} rounded-full`}></span>
                    )}
                  </Link>
                  
                  {user && user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className={`relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive('/admin') 
                          ? scrolled 
                            ? 'text-blue-700 font-semibold' 
                            : 'text-white font-semibold'
                          : scrolled 
                            ? 'text-gray-700 hover:text-blue-700' 
                            : 'text-white hover:text-blue-200'
                      }`}
                    >
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                      </span>
                      {isActive('/admin') && (
                        <span className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-1/2 ${scrolled ? 'bg-blue-600' : 'bg-white'} rounded-full`}></span>
                      )}
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className={`px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive('/login') 
                        ? scrolled 
                          ? 'text-blue-700 font-semibold' 
                          : 'text-white font-semibold'
                        : scrolled 
                          ? 'text-gray-700 hover:text-blue-700' 
                          : 'text-white hover:text-blue-200'
                    } rounded-md`}
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign in
                    </span>
                  </Link>
                  
                  <Link 
                    to="/register" 
                    className={`px-4 py-2 text-sm font-medium ${
                      scrolled 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white' 
                        : 'bg-white text-blue-700'
                    } rounded-md shadow-sm hover:shadow transition-all duration-200`}
                  >
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Sign up
                    </span>
                  </Link>
                </>
              )}
            </div>

            {/* User Menu - Desktop */}
            {isAuthenticated && user && (
              <div className="hidden md:block ml-4">
                <div className="relative group">
                  <button className={`flex items-center transition-all duration-200 space-x-2 p-2 rounded-full ${
                    scrolled 
                      ? 'text-gray-700 hover:bg-gray-100' 
                      : 'text-white hover:bg-blue-700'
                  }`}>
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="ml-2 font-medium">{user.name.split(' ')[0]}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  <div className="absolute right-0 mt-1 w-56 origin-top-right bg-white rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm leading-5 text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Your Profile
                      </div>
                    </Link>
                    
                    <Link 
                      to="/settings" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </div>
                    </Link>
                    
                    <div className="border-t border-gray-100 my-1"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          
            {/* Mobile menu button */}
            <div className="md:hidden ml-2">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-md ${
                  scrolled ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50' : 'text-white hover:text-blue-200 hover:bg-blue-700'
                } focus:outline-none transition-colors duration-200`}
                aria-expanded="false"
              >
                <span className="sr-only">{isOpen ? 'Close main menu' : 'Open main menu'}</span>
                <svg
                  className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden transition-all duration-200 ease-in-out ${scrolled ? 'bg-white shadow-lg' : 'bg-blue-700'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/dashboard') 
                    ? scrolled ? 'bg-blue-50 text-blue-700' : 'bg-blue-800 text-white' 
                    : scrolled ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' : 'text-white hover:bg-blue-800'
                } transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Dashboard
              </Link>
              
              <Link
                to="/upload"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/upload') 
                    ? scrolled ? 'bg-blue-50 text-blue-700' : 'bg-blue-800 text-white' 
                    : scrolled ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' : 'text-white hover:bg-blue-800'
                } transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Resume
              </Link>
              
              {user && user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin') 
                      ? scrolled ? 'bg-blue-50 text-blue-700' : 'bg-blue-800 text-white' 
                      : scrolled ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' : 'text-white hover:bg-blue-800'
                  } transition-colors duration-200`}
                  onClick={() => setIsOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Panel
                </Link>
              )}
              
              {/* User profile section for mobile */}
              <div className={`pt-4 mt-2 border-t ${scrolled ? 'border-gray-200' : 'border-blue-600'}`}>
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                      <span className="text-blue-800 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className={`text-base font-medium ${scrolled ? 'text-gray-800' : 'text-white'}`}>{user.name}</div>
                    <div className={`text-sm font-medium ${scrolled ? 'text-gray-500' : 'text-blue-200'}`}>{user.email}</div>
                  </div>
                </div>
                
                <div className="mt-3 space-y-1 px-2">
                  <Link
                    to="/profile"
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-blue-800'
                    } transition-colors duration-200`}
                    onClick={() => setIsOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Your Profile
                  </Link>
                  
                  <Link
                    to="/settings"
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-blue-800'
                    } transition-colors duration-200`}
                    onClick={() => setIsOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </Link>
                  
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className={`flex w-full items-center px-3 py-2 rounded-md text-base font-medium ${
                      scrolled ? 'text-red-600 hover:bg-red-50' : 'text-red-200 hover:bg-blue-800 hover:text-red-100'
                    } transition-colors duration-200`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/login') 
                    ? scrolled ? 'bg-blue-50 text-blue-700' : 'bg-blue-800 text-white' 
                    : scrolled ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' : 'text-white hover:bg-blue-800'
                } transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign in
              </Link>
              
              <Link
                to="/register"
                className={`flex items-center px-3 py-2 mt-1 rounded-md text-base font-medium ${
                  isActive('/register') 
                    ? scrolled ? 'bg-blue-50 text-blue-700' : 'bg-blue-800 text-white' 
                    : scrolled ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-700' : 'text-white hover:bg-blue-800'
                } transition-colors duration-200`}
                onClick={() => setIsOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Sign up
              </Link>
              
              <div className="pt-4 mt-2 border-t border-blue-600">
                <div className="px-3 py-2">
                  <p className={`text-sm ${scrolled ? 'text-gray-500' : 'text-blue-200'}`}>
                    Analyze your resume with AI to get personalized feedback and improve your chances of landing interviews.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 