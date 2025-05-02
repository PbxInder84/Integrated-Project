import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Homepage = () => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedTips, setExpandedTips] = useState({});

  useEffect(() => {
    setShowAnimation(true);
    
    // Auto-advance the steps
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 4);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleTipToggle = (index) => {
    setExpandedTips(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const steps = [
    {
      title: "Upload Your Resume",
      description: "Securely upload your resume in PDF, DOC, or DOCX format",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      title: "AI-Powered Analysis",
      description: "Our advanced AI analyzes every aspect of your resume",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    },
    {
      title: "Get Detailed Feedback",
      description: "Receive personalized recommendations to improve your resume",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Stand Out to Employers",
      description: "Increase your chances of landing your dream job",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  const nextStepsTips = [
    {
      title: "How to improve your resume score",
      content: "Focus on quantifiable achievements, use action verbs, customize for each job application, include relevant keywords, and ensure proper formatting with consistent styles.",
    },
    {
      title: "Best practices for resume formatting",
      content: "Use a clean, professional template, maintain consistent fonts (10-12pt size), include adequate white space, limit to 1-2 pages, and use bullet points for easy scanning.",
    },
    {
      title: "Skills that employers value most",
      content: "Technical skills specific to your field, communication skills, problem-solving abilities, teamwork, leadership experience, adaptability, and proficiency with relevant software.",
    },
    {
      title: "How to prepare for interviews",
      content: "Research the company thoroughly, prepare answers to common questions, practice with mock interviews, prepare thoughtful questions to ask, and follow up after the interview.",
    },
    {
      title: "Leveraging your resume analysis",
      content: "Apply the feedback from our AI analyzer, focus on addressing the weakest areas first, continuously update your resume, and track improvements in your resume score over time.",
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-8 md:p-12 shadow-xl mb-12">
        <div className={`transition-opacity duration-1000 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Supercharge Your Job Search</h1>
          <p className="text-xl md:text-2xl mb-8">Get your resume analyzed by AI and receive personalized feedback to land your dream job</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/register" 
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-full text-center transition-all transform hover:scale-105"
            >
              Get Started for Free
            </Link>
            <Link 
              to="/login" 
              className="bg-transparent hover:bg-blue-500 text-white border-2 border-white py-3 px-8 rounded-full text-center transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center transition-all duration-500 transform ${
                currentStep === index 
                  ? 'scale-105 shadow-lg border-2 border-blue-500' 
                  : 'scale-100'
              }`}
            >
              <div className={`text-blue-600 mb-4 transition-all duration-500 ${currentStep === index ? 'animate-pulse' : ''}`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Animation Demo Section */}
      <div className="bg-gray-50 p-8 rounded-xl mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">See the Magic in Action</h2>
        <div className="border border-gray-200 rounded-lg bg-white p-6 max-w-3xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-full h-12 bg-gray-200 rounded-md mb-4 overflow-hidden relative">
              <div className="h-full bg-blue-600 absolute left-0 top-0 animate-analyzing-progress"></div>
            </div>
            <div className="flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-gray-700 font-medium">Analyzing your resume...</p>
            </div>
            <div className="space-y-3 w-full">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* What to Do Next Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">What to Do Next?</h2>
        <div className="space-y-4">
          {nextStepsTips.map((tip, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <button 
                className="w-full p-5 text-left flex justify-between items-center hover:bg-blue-50 transition-colors"
                onClick={() => handleTipToggle(index)}
              >
                <h3 className="text-lg font-semibold text-gray-800">{tip.title}</h3>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-6 w-6 text-blue-600 transform transition-transform ${expandedTips[index] ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div 
                className={`transition-all duration-300 overflow-hidden ${
                  expandedTips[index] ? 'max-h-96 p-5 border-t' : 'max-h-0'
                }`}
              >
                <p className="text-gray-700">{tip.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-blue-600 text-white rounded-2xl p-8 text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Ready to Improve Your Resume?</h2>
        <p className="text-xl mb-8">Join thousands of job seekers who have enhanced their resumes with our AI-powered platform</p>
        <Link 
          to="/register" 
          className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 hover:bg-blue-50"
        >
          Get Started Now
        </Link>
      </div>
    </div>
  );
};

export default Homepage; 