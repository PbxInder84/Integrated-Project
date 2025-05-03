import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Homepage = ({ isAuthenticated, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedTips, setExpandedTips] = useState({});
  const [isVisible, setIsVisible] = useState({});
  
  // Animation visibility tracking
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);

  // Auto-advance the steps
  useEffect(() => {
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

  // Stats that showcase the platform benefits
  const stats = [
    { value: '85%', label: 'Users got more interviews' },
    { value: '92%', label: 'Resume improvement rate' },
    { value: '3x', label: 'Faster than manual review' },
    { value: '25K+', label: 'Resumes analyzed monthly' }
  ];

  return (
    <div className="w-full">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 animate-gradient-shift"></div>
        
        {/* Animated shape decorations */}
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-[5%] w-32 h-32 bg-blue-400 opacity-20 rounded-full blur-xl animation-delay-500 animate-float"></div>
        <div className="absolute top-40 left-[15%] w-48 h-48 bg-indigo-300 opacity-10 rounded-full blur-2xl animation-delay-700 animate-float"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="flex flex-col md:flex-row items-center">
            {/* Hero Text Content */}
            <div className="w-full md:w-1/2 text-white mb-12 md:mb-0 md:pr-8 animate-slide-in-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Elevate Your Resume with <span className="text-blue-200">AI Analysis</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100 font-light">
                Get expert-level feedback instantly. Stand out from the competition and land more interviews.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated && user ? (
                  <>
                    <div className="flex items-center bg-white text-blue-700 rounded-lg px-6 py-2 mb-4 sm:mb-0">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-medium">{user.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-medium">Welcome, {user.name.split(' ')[0]}!</span>
                    </div>
                    <Link 
                      to="/dashboard" 
                      className="animate-pulse-shadow bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg text-center transition-all transform hover:scale-105 shadow-lg"
                    >
                      Go to Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/register" 
                      className="animate-pulse-shadow bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg text-center transition-all transform hover:scale-105 shadow-lg"
                    >
                      Get Started Free
                    </Link>
                    <Link 
                      to="/login" 
                      className="bg-transparent hover:bg-blue-500 text-white border-2 border-white py-3 px-8 rounded-lg text-center transition-all hover:shadow-md"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/guest-analysis"
                      className="bg-blue-400 hover:bg-blue-500 text-white py-3 px-8 rounded-lg text-center transition-all hover:shadow-md"
                    >
                      Try Without Login
                    </Link>
                  </>
                )}
              </div>
            </div>
            
            {/* Hero Image/Illustration */}
            <div className="w-full md:w-1/2 animate-slide-in-right">
              <div className="relative bg-white p-4 rounded-lg shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="h-2.5 bg-blue-600 w-24 rounded-full"></div>
                    <div className="h-2.5 bg-blue-600 w-12 rounded-full"></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-2 bg-gray-200 rounded-full"></div>
                    <div className="h-2 bg-gray-200 rounded-full"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-5/6"></div>
                  </div>
                  <div className="border border-gray-200 rounded p-2 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="h-2.5 w-4 bg-green-500 rounded-full mr-2"></div>
                        <div className="h-2 bg-gray-200 rounded-full w-24"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full"></div>
                      <div className="h-2 bg-gray-200 rounded-full w-5/6"></div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded p-2 mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <div className="h-2.5 w-4 bg-yellow-500 rounded-full mr-2"></div>
                        <div className="h-2 bg-gray-200 rounded-full w-32"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full"></div>
                      <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-blue-600 w-16 rounded-full animate-pulse"></div>
                    <div className="flex">
                      <div className="h-5 w-5 rounded-full bg-blue-100 mr-1"></div>
                      <div className="h-5 w-10 rounded-full bg-blue-500"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold py-1 px-3 rounded-full animate-bounce-subtle">
                  AI Powered
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce-subtle">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <div id="stats-section" className="animate-on-scroll bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center ${isVisible['stats-section'] ? 'animate-slide-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.1 + 0.1}s` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* How It Works Section - New Interactive Card Design */}
      <div id="how-it-works" className="animate-on-scroll relative py-20 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-500"></div>
        
        {/* Floating decoration elements */}
        <div className="absolute top-20 right-[5%] w-16 h-16 bg-blue-500 opacity-20 rounded-lg transform rotate-12 animate-float animation-delay-300"></div>
        <div className="absolute bottom-20 left-[5%] w-20 h-20 bg-indigo-500 opacity-10 rounded-full animate-float animation-delay-700"></div>
        <div className="absolute top-1/2 left-[85%] w-24 h-24 bg-blue-400 opacity-10 rounded-lg transform -rotate-12 animate-float"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-gray-800 mb-4 ${isVisible['how-it-works'] ? 'animate-slide-up' : 'opacity-0'}`}>
              How It Works
            </h2>
            <p className={`text-lg text-gray-600 max-w-3xl mx-auto ${isVisible['how-it-works'] ? 'animate-slide-up animation-delay-200' : 'opacity-0'}`}>
              Our AI-powered platform transforms your resume in four simple steps
            </p>
          </div>
          
          {/* Process steps - desktop */}
          <div className="hidden lg:block">
            {/* Progress line */}
            <div className="relative">
              <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 transform -translate-y-1/2 rounded-full"></div>
              <div 
                className="absolute left-0 top-1/2 h-1 bg-blue-600 transform -translate-y-1/2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep + 1) * 25}%` }}
              ></div>
              
              {/* Step cards */}
              <div className="flex justify-between">
                {steps.map((step, index) => (
                  <div key={index} className="relative w-1/4 px-4">
                    {/* Number indicator */}
                    <div 
                      className={`absolute left-1/2 -top-6 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                        index <= currentStep 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      } ${index === currentStep ? 'animate-pulse-shadow scale-110' : ''}`}
                    >
                      <span className="font-bold text-lg">{index + 1}</span>
                    </div>
                    
                    {/* Card */}
                    <div 
                      className={`mt-10 relative bg-white rounded-xl overflow-hidden transition-all duration-500 ${
                        isVisible['how-it-works'] ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                      } ${
                        index === currentStep 
                          ? 'shadow-xl border-2 border-blue-500 scale-105 z-10' 
                          : 'shadow-md hover:shadow-lg border border-gray-100'
                      }`}
                      style={{ animationDelay: `${index * 0.2}s` }}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className={`h-1.5 w-full ${index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                      <div className="p-6">
                        <div className={`mb-4 text-blue-600 transform transition-transform duration-300 ${index === currentStep ? 'scale-110' : 'scale-100'}`}>
                          {step.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">{step.title}</h3>
                        <p className="text-gray-600">{step.description}</p>
                      </div>
                      {index === currentStep && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Process steps - mobile */}
          <div className="lg:hidden">
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>
              <div 
                className="absolute left-4 top-0 w-1 bg-blue-600 rounded-full transition-all duration-500"
                style={{ height: `${(currentStep + 1) * 25}%` }}
              ></div>
              
              {/* Step cards */}
              <div className="space-y-12">
                {steps.map((step, index) => (
                  <div key={index} className="relative">
                    {/* Number indicator */}
                    <div 
                      className={`absolute left-4 transform -translate-x-1/2 translate-y-1/3 w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                        index <= currentStep 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-white text-gray-400 border-2 border-gray-200'
                      } ${index === currentStep ? 'animate-pulse-shadow scale-110' : ''}`}
                    >
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    
                    {/* Card */}
                    <div 
                      className={`ml-12 relative bg-white rounded-xl overflow-hidden transition-all duration-500 ${
                        isVisible['how-it-works'] ? 'transform translate-y-0 opacity-100' : 'transform translate-y-8 opacity-0'
                      } ${
                        index === currentStep 
                          ? 'shadow-xl border-2 border-blue-500' 
                          : 'shadow-md hover:shadow-lg border border-gray-100'
                      }`}
                      style={{ animationDelay: `${index * 0.2}s` }}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className={`w-1.5 h-full absolute left-0 top-0 ${index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                      <div className="p-5">
                        <div className={`mb-3 text-blue-600 transform transition-transform duration-300 ${index === currentStep ? 'scale-110' : 'scale-100'}`}>
                          {step.icon}
                        </div>
                        <h3 className="text-lg font-semibold mb-2 text-gray-800">{step.title}</h3>
                        <p className="text-gray-600 text-sm">{step.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Call to action below steps */}
          <div className={`mt-16 text-center ${isVisible['how-it-works'] ? 'animate-fade-in animation-delay-500' : 'opacity-0'}`}>
            {isAuthenticated && user ? (
              <Link 
                to="/upload" 
                className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Your Resume Now
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/register" 
                  className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Get Started For Free
                </Link>
                <Link 
                  to="/guest-analysis" 
                  className="inline-flex items-center px-8 py-3 bg-gray-100 hover:bg-gray-200 text-blue-700 font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Try Without Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Animation Demo Section */}
      <div id="demo-section" className="animate-on-scroll bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center text-gray-800 mb-12 ${isVisible['demo-section'] ? 'animate-slide-up' : 'opacity-0'}`}>
            See the Magic in Action
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            {/* Demo preview panel */}
            <div className={`w-full md:w-2/3 lg:w-1/2 ${isVisible['demo-section'] ? 'animate-slide-in-left' : 'opacity-0'}`}>
              <div className="border border-gray-200 rounded-xl bg-white p-6 shadow-xl">
                <div className="flex flex-col items-center">
                  <div className="w-full h-2.5 bg-gray-200 rounded-full mb-6 overflow-hidden relative">
                    <div className="h-full bg-blue-600 absolute left-0 top-0 animate-analyzing-progress"></div>
                  </div>
                  <div className="flex items-center justify-center mb-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mr-3"></div>
                    <p className="text-gray-700 text-xl font-medium">Analyzing your resume...</p>
                  </div>
                  <div className="space-y-3 w-full mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-6 bg-blue-600 rounded w-32 flex items-center justify-center text-white text-xs font-bold">Content Analysis</div>
                      <div className="h-4 bg-gray-200 rounded-full w-36"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-11/12"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 animation-delay-200"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6 animation-delay-300"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 animation-delay-400"></div>
                  </div>
                  
                  <div className="space-y-3 w-full mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-6 bg-green-600 rounded w-32 flex items-center justify-center text-white text-xs font-bold">Format Analysis</div>
                      <div className="h-4 bg-gray-200 rounded-full w-36"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-11/12 animation-delay-200"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 animation-delay-300"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6 animation-delay-400"></div>
                  </div>
                  
                  <div className="w-36 h-10 bg-blue-600 text-white font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse-shadow">
                    View Report
                  </div>
                </div>
              </div>
            </div>
            
            {/* Demo text content */}
            <div className={`w-full md:w-1/3 lg:w-1/2 ${isVisible['demo-section'] ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Advanced AI Analysis</h3>
              <div className="space-y-4 text-gray-600">
                <p>Our AI doesn't just scan your resume - it understands it. Using cutting-edge natural language processing, we analyze:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Resume structure and formatting</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Keyword relevance to your industry</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Impact of achievements and skills</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 mr-2 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>ATS compatibility score</span>
                  </li>
                </ul>
                <p className="font-medium">Get personalized recommendations in seconds, not days.</p>
                {!isAuthenticated && (
                  <div className="mt-6">
                    <Link 
                      to="/guest-analysis" 
                      className="inline-flex items-center px-6 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition-all hover:shadow-md"
                    >
                      Try It Now - No Login Required
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* What to Do Next Section - Redesigned accordion */}
      <div id="tips-section" className="animate-on-scroll bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-3xl font-bold text-center text-gray-800 mb-8 ${isVisible['tips-section'] ? 'animate-slide-up' : 'opacity-0'}`}>
            Expert Resume Tips
          </h2>
          <div className="space-y-3">
            {nextStepsTips.map((tip, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 
                  ${expandedTips[index] ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'} 
                  ${isVisible['tips-section'] ? 'animate-fade-in' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <button 
                  className="w-full p-5 text-left flex justify-between items-center transition-colors hover:bg-blue-50"
                  onClick={() => handleTipToggle(index)}
                  aria-expanded={expandedTips[index]}
                >
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold mr-3">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-800">{tip.title}</h3>
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-6 w-6 text-blue-600 transform transition-transform duration-300 ${expandedTips[index] ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  className={`transition-all duration-300 overflow-hidden ${
                    expandedTips[index] ? 'max-h-96 p-5 pt-0 border-t' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-700 pl-11">{tip.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Call to Action - More engaging with background pattern */}
      <div id="cta-section" className="animate-on-scroll relative py-16 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 animate-gradient-shift"></div>
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" width="1120" height="560" viewBox="0 0 1120 560">
            <defs>
              <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle fill="rgba(255,255,255,0.4)" cx="4" cy="4" r="2" />
              </pattern>
            </defs>
            <rect width="1120" height="560" fill="url(#dots)" />
          </svg>
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`${isVisible['cta-section'] ? 'animate-slide-up' : 'opacity-0'}`}>
            {isAuthenticated && user ? (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Analyze Your Resume?</h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Upload your resume now and get instant AI-powered feedback to improve your chances of landing your dream job.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link 
                    to="/upload" 
                    className="animate-pulse-shadow bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg text-center transition-all transform hover:scale-105 shadow-lg"
                  >
                    Upload Resume
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="bg-transparent hover:bg-blue-500 text-white border-2 border-white py-3 px-8 rounded-lg text-center transition-all hover:shadow-md"
                  >
                    View Dashboard
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Improve Your Resume?</h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">Join thousands of job seekers who have enhanced their resumes with our AI-powered platform</p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link 
                    to="/register" 
                    className="animate-pulse-shadow bg-white text-blue-700 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg text-center transition-all transform hover:scale-105 shadow-lg"
                  >
                    Get Started Free
                  </Link>
                  <Link 
                    to="/login" 
                    className="bg-transparent hover:bg-blue-500 text-white border-2 border-white py-3 px-8 rounded-lg text-center transition-all hover:shadow-md"
                  >
                    Learn More
                  </Link>
                  <Link 
                    to="/guest-analysis" 
                    className="bg-blue-200 text-blue-800 hover:bg-blue-300 font-medium py-3 px-8 rounded-lg text-center transition-all hover:shadow-md"
                  >
                    Try Without Login
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage; 