import React, { useEffect } from 'react';

const Preloader = ({ isLoading }) => {
  useEffect(() => {
    // Disable scrolling when preloader is active
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800">
      <div className="relative">
        {/* Main circular loader */}
        <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        
        {/* Pulsing inner circle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-blue-500 rounded-full animate-pulse opacity-70"></div>
        
        {/* Document icon in the center */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        
        {/* Orbiting small circle */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full animate-orbit origin-[0_24px]"></div>
      </div>
      
      {/* Loading text with typing animation */}
      <div className="absolute bottom-1/3 left-0 right-0 text-center">
        <p className="text-white text-xl font-medium animate-pulse">
          Analyzing Resumes
          <span className="animate-ellipsis">.</span>
          <span className="animate-ellipsis animation-delay-300">.</span>
          <span className="animate-ellipsis animation-delay-600">.</span>
        </p>
      </div>
    </div>
  );
};

export default Preloader; 