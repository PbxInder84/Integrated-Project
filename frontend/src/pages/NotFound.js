import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Page Not Found</p>
      <Link
        to="/"
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound; 