import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <h1 className="text-5xl font-bold mb-6">Welcome to CV Analyzer</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        Improve your resume's ATS score with our AI-powered analysis tool.
        Get detailed feedback and increase your chances of landing that dream job.
      </p>
      <div className="flex space-x-4">
        <Link
          to="/register"
          className="bg-white text-blue-700 font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg shadow-lg hover:bg-gray-300 transition duration-300"
        >
          Login
        </Link>
      </div>
    </div>
  );
};

export default Home;