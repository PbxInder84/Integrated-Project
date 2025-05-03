import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AIAnalysis from './AIAnalysis';

const ResumeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reanalyzing, setReanalyzing] = useState(false);
  const [reanalyzeProgress, setReanalyzeProgress] = useState(0);
  const [scoreImprovement, setScoreImprovement] = useState(null);
  const [showScoreChange, setShowScoreChange] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [animatedSections, setAnimatedSections] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  // Add state for working states of jobs
  const [workingStatus, setWorkingStatus] = useState([
    { id: 1, company: 'Microsoft', status: 'Applied', date: '2023-05-15', notes: 'Waiting for response' },
    { id: 2, company: 'Google', status: 'Interview', date: '2023-06-02', notes: 'Technical interview scheduled' },
    { id: 3, company: 'Amazon', status: 'Offered', date: '2023-06-10', notes: 'Received offer, reviewing terms' },
  ]);
  
  // References for scroll animations
  const sectionsRef = useRef({});
  
  // Animation trigger on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setAnimatedSections(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, { threshold: 0.1 });
    
    Object.values(sectionsRef.current).forEach(el => {
      if (el) observer.observe(el);
    });
    
    // Ensure all sections for the current tab are visible immediately
    setTimeout(() => {
      const currentSection = `${activeTab}-section`;
      if (sectionsRef.current[currentSection]) {
        setAnimatedSections(prev => ({ ...prev, [currentSection]: true }));
      }
    }, 100);
    
    return () => observer.disconnect();
  }, [resume, activeTab]);

  const addSectionRef = (id, el) => {
    if (el && !sectionsRef.current[id]) {
      sectionsRef.current[id] = el;
    }
  };

  useEffect(() => {
    const fetchResumeDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/resume/${id}`);
        setResume(res.data);
        console.log("Resume data loaded:", res.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch resume details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeDetails();
  }, [id]);

  useEffect(() => {
    // Log when active tab changes
    console.log("Active tab changed to:", activeTab);
  }, [activeTab]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await axios.delete(`/resume/${id}`);
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to delete resume');
        console.error(err);
      }
    }
  };

  const handleReanalyze = async () => {
    if (window.confirm('Re-analyze this resume? This will process your resume again with the latest AI model.')) {
      try {
        setReanalyzing(true);
        setError('');
        
        // Store the previous score for comparison
        const previousScore = resume.analysis.score;
        
        // Simulate progress animation
        const progressInterval = setInterval(() => {
          setReanalyzeProgress(prev => {
            const increment = Math.random() * 8 + 2; // Random increment between 2-10
            const newProgress = Math.min(prev + increment, 95);
            return newProgress;
          });
        }, 300);
        
        // Make the actual API call
        const response = await axios.post(`/resume/${id}/reanalyze`);
        
        // Clear interval and update resume with new data
        clearInterval(progressInterval);
        setReanalyzeProgress(100);
        
        // Calculate score difference
        const newScore = response.data.analysis.score;
        const improvement = newScore - previousScore;
        setScoreImprovement(improvement);
        
        // Brief delay to show 100% completion
        setTimeout(() => {
          setResume(response.data);
          setReanalyzing(false);
          setReanalyzeProgress(0);
          setShowScoreChange(true);
          
          // Hide score change after 5 seconds
          setTimeout(() => {
            setShowScoreChange(false);
          }, 5000);
        }, 500);
        
      } catch (err) {
        setError('Failed to re-analyze resume. Please try again.');
        console.error(err);
        setReanalyzing(false);
        setReanalyzeProgress(0);
      }
    }
  };

  const handleRequestAIAnalysis = async () => {
    try {
      setAiAnalysisLoading(true);
      setError('');
      
      const response = await axios.post(`/resume/${id}/ai-analysis`);
      
      // Update resume with AI analysis data
      setResume(prev => ({
        ...prev,
        aiAnalysis: response.data.aiAnalysis
      }));
      
    } catch (err) {
      // Extract the specific error message from the API response if available
      const errorMessage = err.response?.data?.error || 
                          'Failed to generate AI analysis. Please try again.';
      
      setError(`AI Analysis Error: ${errorMessage}`);
      console.error('AI Analysis Error:', err);
      
      // Display alert with more information about rate limits
      if (err.response?.status === 429) {
        alert('OpenAI API rate limit reached. Please try again later or consider upgrading your API plan.');
      }
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreDescription = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <h2 className="mt-6 text-xl font-bold text-gray-800 animate-pulse">Loading Resume Analysis...</h2>
          <p className="mt-2 text-gray-600">Retrieving your detailed resume feedback</p>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg mb-6 shadow-md animate-fade-in">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-bold mb-1">Error Loading Resume</h3>
              <p>{error || 'Resume not found or no longer available'}</p>
        </div>
          </div>
        </div>
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
      {/* Header with back button and actions */}
      <div 
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-b-lg shadow-lg mb-8 px-6 py-6 text-white animate-fade-in" 
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <Link to="/dashboard" className="inline-flex items-center text-blue-100 hover:text-white font-medium transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
        </Link>
            <h1 className="text-2xl md:text-3xl font-bold mt-2">{resume.fileName}</h1>
            <p className="text-blue-200 mt-1">
              Uploaded on {new Date(resume.uploadDate).toLocaleDateString()}
              {resume.lastAnalyzed && resume.lastAnalyzed !== resume.uploadDate && (
                <span className="ml-2">
                  (Last analyzed: {new Date(resume.lastAnalyzed).toLocaleDateString()})
                </span>
              )}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className={`${getScoreBackground(resume.analysis.score)} text-center p-4 rounded-lg shadow-md transition-all transform hover:scale-105`}>
              <div className="text-3xl font-bold mb-1">
                <span className={getScoreColor(resume.analysis.score)}>
                  {resume.analysis.score}%
                </span>
              </div>
              <div className="text-sm font-medium">{getScoreDescription(resume.analysis.score)}</div>
            </div>
            
            <div className="flex flex-col space-y-2">
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
                className={`bg-white hover:bg-blue-50 text-blue-700 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center shadow-md transition-all ${
                  reanalyzing ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
          >
            {reanalyzing ? (
              <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Re-analyzing...
              </>
            ) : (
              <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-analyze Resume
              </>
            )}
          </button>
              
          <button
            onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center shadow-md hover:shadow-lg transition-all"
          >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            Delete Resume
          </button>
            </div>
          </div>
        </div>
      </div>

      {/* Re-analyzing progress bar */}
      {reanalyzing && (
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Re-analyzing Your Resume
          </h3>
          <p className="text-gray-600 mb-4">Our AI engine is analyzing your resume to provide updated feedback and recommendations...</p>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" 
              style={{ width: `${reanalyzeProgress}%`, transition: 'width 0.3s ease' }}
            ></div>
          </div>
          
          <div className="flex items-center justify-center text-gray-600">
            <div className="w-8 h-8 rounded-full border-2 border-t-blue-600 border-blue-200 animate-spin mr-3"></div>
            <p>
              Extracting information, analyzing content, and generating comprehensive feedback...
            </p>
          </div>
        </div>
      )}

      {/* Score change notification */}
      {showScoreChange && scoreImprovement !== null && (
        <div className={`mb-8 p-6 rounded-xl shadow-lg transition-all duration-500 animate-fade-in ${
          scoreImprovement > 0 
            ? 'bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500' 
            : scoreImprovement < 0 
              ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500' 
              : 'bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500'
        }`}>
          <div className="flex items-center">
            {scoreImprovement > 0 ? (
              <div className="rounded-full bg-green-200 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              </div>
            ) : scoreImprovement < 0 ? (
              <div className="rounded-full bg-yellow-200 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
              </div>
            ) : (
              <div className="rounded-full bg-blue-200 p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold mb-1">
                {scoreImprovement > 0 
                  ? `Resume Score Improved by ${scoreImprovement.toFixed(1)}%!` 
                  : scoreImprovement < 0 
                    ? `Resume Score Decreased by ${Math.abs(scoreImprovement).toFixed(1)}%` 
                    : 'Resume Score Unchanged'}
              </h3>
              <p className="text-gray-600">
                {scoreImprovement > 0 
                  ? "Great job! Your resume's effectiveness has improved." 
                  : scoreImprovement < 0 
                    ? "Some changes may have negatively impacted your score. Check the recommendations below." 
                    : "Your resume score remains the same after re-analysis."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'details', 'feedback', 'ai-analysis', 'working', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300
                ${activeTab === tab 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab === 'overview' && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Overview
                </div>
              )}
              {tab === 'details' && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Details
                </div>
              )}
              {tab === 'feedback' && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  Feedback
                </div>
              )}
              {tab === 'ai-analysis' && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Analysis
                </div>
              )}
              {tab === 'working' && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Working
                </div>
              )}
              {tab === 'history' && (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  History
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="space-y-8 block w-full min-h-[400px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && resume && (
          <div 
            id="overview-section" 
            ref={(el) => addSectionRef('overview-section', el)}
            className={`transition-all duration-500 ${
              animatedSections['overview-section'] 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Resume Score Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6 flex justify-between items-center">
                  <h3 className="text-white font-bold text-lg">Resume Score</h3>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
        <div className="p-6">
                  <div className="flex items-center justify-center">
                    <div className={`
                      text-5xl font-bold flex items-center justify-center
                      ${resume.analysis.score >= 80 ? 'text-green-600' : 
                      resume.analysis.score >= 60 ? 'text-yellow-600' : 'text-red-600'}
                    `}>
                      {resume.analysis.score}%
                    </div>
                    <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3">
                      {resume.analysis.score >= 80 ? (
                        <div className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Excellent
                        </div>
                      ) : resume.analysis.score >= 60 ? (
                        <div className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Good
                        </div>
                      ) : (
                        <div className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                          Needs Work
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress bars */}
                  <div className="mt-6 space-y-4">
            <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Content Quality</span>
                        <span className="text-sm font-medium text-gray-700">
                          {Math.min(Math.max(resume.analysis.score + 5, 0), 100)}%
                  </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min(Math.max(resume.analysis.score + 5, 0), 100)}%` }}
                        ></div>
                      </div>
            </div>
            
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">ATS Compatibility</span>
                        <span className="text-sm font-medium text-gray-700">
                          {Math.min(Math.max(resume.analysis.score - 10, 0), 100)}%
                </span>
              </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min(Math.max(resume.analysis.score - 10, 0), 100)}%` }}
                        ></div>
            </div>
          </div>

            <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Keyword Optimization</span>
                        <span className="text-sm font-medium text-gray-700">
                          {Math.min(Math.max(resume.analysis.score - 5, 0), 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-1000" 
                          style={{ width: `${Math.min(Math.max(resume.analysis.score - 5, 0), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Personal Info Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6 flex justify-between items-center">
                  <h3 className="text-white font-bold text-lg">Personal Information</h3>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="font-medium text-gray-900 text-base">
                        {resume.parseData.name ? resume.parseData.name.trim() : 'Not detected'}
                      </p>
                </div>
                  </div>
                  
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="font-medium">
                        {resume.parseData.email ? (
                          <a href={`mailto:${resume.parseData.email}`} className="text-blue-600 hover:underline">
                            {resume.parseData.email}
                          </a>
                        ) : 'Not detected'}
                      </p>
                </div>
                  </div>
                  
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="font-medium">
                        {resume.parseData.phone ? (
                          <a href={`tel:${resume.parseData.phone}`} className="text-blue-600 hover:underline">
                            {resume.parseData.phone}
                          </a>
                        ) : 'Not detected'}
                      </p>
                </div>
              </div>
                  
                  {resume.parseData.linkedin && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">LinkedIn</label>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="font-medium">
                          <a href={resume.parseData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                            </svg>
                            LinkedIn Profile
                          </a>
                        </p>
            </div>
                    </div>
                  )}
            
                  {resume.parseData.github && (
            <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">GitHub</label>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="font-medium">
                          <a href={resume.parseData.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            GitHub Profile
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Skills Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6 flex justify-between items-center">
                  <h3 className="text-white font-bold text-lg">Skills</h3>
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                {resume.parseData.skills && resume.parseData.skills.length > 0 ? (
                  resume.parseData.skills.map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium animate-pulse-soft"
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                      {skill}
                    </span>
                  ))
                ) : (
                      <p className="text-gray-500 italic">No skills detected</p>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4 mt-4 border-l-4 border-blue-500">
                    <h4 className="font-medium text-blue-800 mb-2">Skills Impact Your Score</h4>
                    <p className="text-sm text-blue-700">
                      Well-chosen, relevant skills can improve your resume's ATS compatibility and help you stand out to recruiters.
                    </p>
                  </div>
              </div>
            </div>
          </div>

            {/* Quick Feedback Section */}
            <div 
              className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl"
              style={{ transitionDelay: '0.2s' }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Quick Feedback</h3>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
            </div>
          </div>

              <div className="p-6">
                <div className="space-y-4">
              {resume.analysis.feedback && resume.analysis.feedback.length > 0 ? (
                    resume.analysis.feedback.slice(0, 3).map((feedback, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start p-4 rounded-lg border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-sm animate-fade-in"
                        style={{ animationDelay: `${idx * 0.2}s` }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                        <p className="text-gray-800">{feedback}</p>
                  </div>
                ))
              ) : (
                    <div className="flex items-start p-4 rounded-lg border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-green-700 font-medium">
                  No improvement suggestions. Great job!
                </p>
                    </div>
              )}
            </div>
                
                {resume.analysis.feedback && resume.analysis.feedback.length > 3 && (
                  <div className="mt-4 text-center">
                    <button 
                      onClick={() => setActiveTab('feedback')}
                      className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                    >
                      View All Feedback
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
          </div>
                )}
        </div>
      </div>
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'details' && resume && (
          <div 
            id="details-section" 
            ref={(el) => addSectionRef('details-section', el)}
            className={`transition-all duration-500 ${
              animatedSections['details-section'] 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6">
                <h3 className="text-white font-bold text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
                  Resume Details
                </h3>
            </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Document Information</h4>
                  
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Filename</dt>
                      <dd className="mt-1 text-gray-900 bg-gray-50 rounded-lg p-3">{resume.fileName}</dd>
          </div>
          
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                      <dd className="mt-1 text-gray-900 bg-gray-50 rounded-lg p-3">
                        {new Date(resume.uploadDate).toLocaleString()}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Analyzed</dt>
                      <dd className="mt-1 text-gray-900 bg-gray-50 rounded-lg p-3">
                        {resume.lastAnalyzed 
                          ? new Date(resume.lastAnalyzed).toLocaleString()
                          : 'Same as upload date'}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">File Size</dt>
                      <dd className="mt-1 text-gray-900 bg-gray-50 rounded-lg p-3">
                        {resume.fileSize ? `${(resume.fileSize / 1024).toFixed(2)} KB` : 'Unknown'}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Education</h4>
                  
                  {resume.parseData.education && resume.parseData.education.length > 0 ? (
                    <div className="space-y-3 mt-3">
                      {resume.parseData.education.map((edu, idx) => (
                        <div 
                          key={idx} 
                          className="bg-blue-50 border border-blue-100 rounded-lg p-3 shadow-sm animate-fade-in"
                          style={{ animationDelay: `${idx * 0.15}s` }}
                        >
                          <p className="text-gray-800">{edu}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-3 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            No education details detected in your resume. Adding your educational background can improve your score.
            </p>
          </div>
                      </div>
                    </div>
                  )}
                  
                  <h4 className="text-lg font-semibold text-gray-800 mt-8 mb-4 border-b border-gray-200 pb-2">Experience</h4>
                  
                  {resume.parseData.experience && resume.parseData.experience.length > 0 ? (
                    <div className="space-y-3 mt-3">
                      {resume.parseData.experience.map((exp, idx) => (
                        <div 
                          key={idx} 
                          className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 shadow-sm animate-fade-in"
                          style={{ animationDelay: `${idx * 0.15}s` }}
                        >
                          <p className="text-gray-800">{exp}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-3 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700 font-medium">
                            No work experience detected in your resume.
                          </p>
                          <p className="text-sm text-yellow-700 mt-1">
                            If you're a fresher, that's okay! Focus on showcasing your education, academic projects, volunteer work, and relevant skills to demonstrate your capabilities.
                          </p>
                          <div className="mt-2 bg-white p-2 rounded border border-yellow-200">
                            <span className="text-xs font-medium text-gray-700">Tips for freshers:</span>
                            <ul className="text-xs text-gray-600 mt-1 list-disc pl-4">
                              <li>Highlight relevant coursework and academic achievements</li>
                              <li>Showcase technical projects with quantifiable results</li>
                              <li>Include internships, volunteer work, or part-time positions</li>
                            </ul>
          </div>
        </div>
                      </div>
                    </div>
                  )}

                  {/* New Projects Section */}
                  <h4 className="text-lg font-semibold text-gray-800 mt-8 mb-4 border-b border-gray-200 pb-2">Projects</h4>
                  
                  {resume.parseData.projects && resume.parseData.projects.length > 0 ? (
                    <div className="space-y-3 mt-3">
                      {resume.parseData.projects.map((project, idx) => (
                        <div 
                          key={idx} 
                          className="bg-green-50 border border-green-100 rounded-lg p-3 shadow-sm animate-fade-in"
                          style={{ animationDelay: `${idx * 0.15}s` }}
                        >
                          {project.name && <p className="text-gray-900 font-medium mb-1">{project.name}</p>}
                          {project.description && <p className="text-gray-800 text-sm">{project.description}</p>}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {project.technologies.map((tech, techIdx) => (
                                <span key={techIdx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-3 rounded-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            No projects detected in your resume. Adding relevant projects can significantly improve your resume's impact, especially if you're a fresher or have limited work experience.
                          </p>
                        </div>
                      </div>
              </div>
            )}
                </div>
              </div>
              
              <div className="p-6 pt-0">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                    Resume Optimization Tips
                  </h4>
                  
                  <ul className="mt-3 space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Include measurable achievements with quantifiable results when possible</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Tailor your resume for each job application by matching keywords from the job description</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="flex-shrink-0 h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Use the same formatting consistently throughout your resume</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
              </div>
            )}
            
        {/* Feedback Tab */}
        {activeTab === 'feedback' && resume && (
          <div 
            id="feedback-section" 
            ref={(el) => addSectionRef('feedback-section', el)}
            className={`transition-all duration-500 ${
              animatedSections['feedback-section'] 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6">
                <h3 className="text-white font-bold text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
                  Feedback & Suggestions
                </h3>
            </div>
            
              <div className="p-6">
                {resume.analysis.feedback && resume.analysis.feedback.length > 0 ? (
                  <div className="space-y-5">
                    {resume.analysis.feedback.map((feedback, idx) => (
                      <div 
                        key={idx} 
                        className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg shadow-sm overflow-hidden animate-fade-in"
                        style={{ animationDelay: `${idx * 0.15}s` }}
                      >
                        <div className="p-5 border-l-4 border-yellow-500">
              <div className="flex items-start">
                            <div className="bg-yellow-100 rounded-full p-2 mr-4 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="text-base font-semibold text-gray-800 mb-1">Improvement Suggestion #{idx + 1}</h4>
                              <p className="text-gray-700">{feedback}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 ml-11 bg-white rounded-lg border border-yellow-200 p-4">
                            <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              How to Address This:
                            </h5>
                            <p className="text-sm text-gray-600">
                              {idx % 3 === 0 && 'Focus on quantifiable achievements and metrics that demonstrate your impact. Use action verbs and be specific about results.'}
                              {idx % 3 === 1 && 'Ensure your skills and experience are aligned with the job descriptions you\'re targeting. Include relevant keywords that appear in job postings.'}
                              {idx % 3 === 2 && 'Structure your resume with clear sections and consistent formatting. Make it easy for both ATS systems and human recruiters to scan quickly.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg flex items-start animate-fade-in">
                    <div className="bg-green-100 rounded-full p-2 mr-4 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-green-800 mb-2">Great Job!</h4>
                      <p className="text-green-700">
                        Your resume looks excellent! We don't have any specific improvement suggestions at this time.
                        Continue to keep your resume updated with your latest achievements and tailored to each job application.
                      </p>
                    </div>
              </div>
            )}
                
                <div className="mt-8 bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pro Tips for Resume Success
                  </h4>
                  
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <h5 className="font-medium text-blue-700 mb-2">Tailor for Each Job</h5>
                      <p className="text-sm text-gray-600">
                        Customize your resume for each position by matching keywords from the job description.
                        This improves your chances of passing Applicant Tracking Systems (ATS).
                      </p>
          </div>
          
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <h5 className="font-medium text-blue-700 mb-2">Quantify Your Achievements</h5>
                      <p className="text-sm text-gray-600">
                        Use numbers and metrics to demonstrate your impact. Instead of "Increased sales", 
                        try "Increased sales by 27% over 6 months".
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <h5 className="font-medium text-blue-700 mb-2">Use Action Verbs</h5>
                      <p className="text-sm text-gray-600">
                        Begin bullet points with strong action verbs like "achieved", "implemented", or "managed"
                        to create a strong impression of your capabilities.
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <h5 className="font-medium text-blue-700 mb-2">Keep It Concise</h5>
                      <p className="text-sm text-gray-600">
                        Most resumes should be 1-2 pages maximum. Focus on relevant experience 
                        and eliminate outdated or irrelevant information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Analysis Tab */}
        {activeTab === 'ai-analysis' && resume && (
          <div 
            id="ai-analysis-section" 
            ref={(el) => addSectionRef('ai-analysis-section', el)}
            className={`transition-all duration-500 ${
              animatedSections['ai-analysis-section'] 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <AIAnalysis 
              aiAnalysis={resume.aiAnalysis} 
              onRequestAnalysis={handleRequestAIAnalysis}
              loading={aiAnalysisLoading}
              error={error}
            />
          </div>
        )}

        {/* Working Tab */}
        {activeTab === 'working' && resume && (
          <div 
            id="working-section" 
            ref={(el) => addSectionRef('working-section', el)}
            className={`transition-all duration-500 ${
              animatedSections['working-section'] 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 transform transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6">
                <h3 className="text-white font-bold text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
                  Job Application Tracking
                </h3>
          </div>
              
              <div className="p-6">
                <div className="bg-blue-50 rounded-lg p-4 mb-6 border-l-4 border-blue-500">
                  <h4 className="font-medium text-blue-800 mb-2">Track Your Resume Usage</h4>
                  <p className="text-sm text-blue-700">
                    Keep track of all the jobs you've applied to using this resume. This helps you manage follow-ups and track your application progress.
                  </p>
        </div>
                
                {/* Job Application Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {workingStatus.map((job, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{job.company}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${job.status === 'Applied' ? 'bg-yellow-100 text-yellow-800' : 
                                job.status === 'Interview' ? 'bg-blue-100 text-blue-800' : 
                                job.status === 'Offered' ? 'bg-green-100 text-green-800' :
                                job.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(job.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {job.notes}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                            <button className="text-red-600 hover:text-red-900">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
      </div>

                {/* Add New Job Application */}
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Add New Job Application</h4>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        id="company"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Company name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        id="status"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option>Applied</option>
                        <option>Interview</option>
                        <option>Offered</option>
                        <option>Rejected</option>
                        <option>Withdrawn</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        id="date"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        id="notes"
                        rows="3"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Add any notes about the application..."
                      ></textarea>
                    </div>
                    
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Job Application
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            {/* Job Application Tips */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 px-6">
                <h3 className="text-white font-bold text-lg flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Job Application Tips
                </h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 shadow-sm">
                    <h4 className="font-medium text-indigo-700 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Follow Up After Applying
                    </h4>
                    <p className="text-sm text-indigo-600">
                      If you haven't heard back within a week, send a polite follow-up email expressing your continued interest in the position.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 shadow-sm">
                    <h4 className="font-medium text-purple-700 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Research the Company
                    </h4>
                    <p className="text-sm text-purple-600">
                      Before interviews, research the company thoroughly. Understand their products, values, and recent news to demonstrate your interest.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
                    <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Prepare for Common Questions
                    </h4>
                    <p className="text-sm text-blue-600">
                      Practice answers to common interview questions, prepare examples of your accomplishments, and rehearse your elevator pitch.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm">
                    <h4 className="font-medium text-green-700 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Send Thank You Notes
                    </h4>
                    <p className="text-sm text-green-600">
                      After interviews, send personalized thank-you emails within 24 hours. Reference specific points from your conversation to show attentiveness.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score History Tab */}
        {activeTab === 'history' && resume && (
          <div 
            id="history-section" 
            ref={(el) => addSectionRef('history-section', el)}
            className={`transition-all duration-500 ${
              animatedSections['history-section'] 
                ? 'opacity-100 transform translate-y-0' 
                : 'opacity-0 transform translate-y-8'
            }`}
          >
            {resume.analysisHistory && resume.analysisHistory.length > 1 ? (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
                  Your Resume Score Evolution
          </h3>
          
                <div className="p-4 bg-gray-50 rounded-lg mb-6">
                  <p className="text-gray-700">
                    Track how your resume score has improved over time. Each bar represents an analysis, with the most recent on the right.
                    {resume.analysisHistory.length > 2 && ` Your score has ${
                      resume.analysisHistory[resume.analysisHistory.length - 1].score > resume.analysisHistory[0].score
                        ? 'improved'
                        : 'changed'
                    } from ${resume.analysisHistory[0].score}% to ${resume.analysisHistory[resume.analysisHistory.length - 1].score}% over time.`}
                  </p>
                </div>
                
                <div className="relative h-[250px]">
                  {/* Chart grid lines */}
                  <div className="absolute inset-0">
                    <div className="grid grid-cols-1 h-full">
                      <div className="border-t border-gray-200 relative">
                        <span className="absolute -left-8 -top-3 text-xs text-gray-500">100%</span>
                      </div>
                      <div className="border-t border-gray-200 relative">
                        <span className="absolute -left-8 -top-3 text-xs text-gray-500">75%</span>
                      </div>
                      <div className="border-t border-gray-200 relative">
                        <span className="absolute -left-8 -top-3 text-xs text-gray-500">50%</span>
                      </div>
                      <div className="border-t border-gray-200 relative">
                        <span className="absolute -left-8 -top-3 text-xs text-gray-500">25%</span>
                      </div>
                      <div className="border-t border-gray-200 relative">
                        <span className="absolute -left-8 -top-3 text-xs text-gray-500">0%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart bars */}
                  <div className="absolute inset-x-0 bottom-0 flex justify-center items-end space-x-4 h-[200px]">
              {resume.analysisHistory.map((entry, index) => {
                      // Convert percentage to height (0-100% maps to 0-200px)
                      const barHeight = (entry.score / 100) * 200;
                      
                      let barColor = 'from-red-400 to-red-500';
                      if (entry.score >= 80) barColor = 'from-green-400 to-green-500';
                      else if (entry.score >= 60) barColor = 'from-yellow-400 to-yellow-500';
                
                return (
                  <div key={index} className="flex flex-col items-center" style={{ minWidth: '60px' }}>
                    <div 
                            className={`w-14 rounded-t-lg bg-gradient-to-b ${barColor} shadow-lg hover:opacity-90 transition-all duration-300 cursor-pointer group relative animate-rise`}
                            style={{ 
                              height: `${barHeight}px`,
                              animationDelay: `${index * 0.1}s`
                            }}
                          >
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Score: {entry.score}%
                      </div>
                    </div>
                          <div className="mt-2 text-xs text-gray-600 font-medium py-2">
                      {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    {index === 0 && (
                            <div className="text-xs font-semibold text-blue-600 mt-1">Initial</div>
                    )}
                    {index === resume.analysisHistory.length - 1 && index !== 0 && (
                            <div className="text-xs font-semibold text-green-600 mt-1">Latest</div>
                    )}
                  </div>
                );
              })}
                  </div>
            </div>
            
                {/* Score details table */}
                <div className="mt-12 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {resume.analysisHistory.map((entry, index) => {
                        const prevScore = index > 0 ? resume.analysisHistory[index - 1].score : null;
                        const scoreDiff = prevScore !== null ? entry.score - prevScore : null;
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(entry.date).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(entry.date).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${
                                entry.score >= 80 ? 'text-green-600' : 
                                entry.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {entry.score}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {scoreDiff !== null && (
                                <div className={`text-sm font-medium flex items-center ${
                                  scoreDiff > 0 ? 'text-green-600' : 
                                  scoreDiff < 0 ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                  {scoreDiff > 0 && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                  )}
                                  {scoreDiff < 0 && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                  )}
                                  {scoreDiff === 0 && (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                    </svg>
                                  )}
                                  {scoreDiff > 0 ? '+' : ''}{scoreDiff.toFixed(1)}%
            </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index === 0 ? 'Initial analysis' : 
                               index === resume.analysisHistory.length - 1 ? 'Latest analysis' : 
                               `Analysis #${index + 1}`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
          </div>
        </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center mb-8 animate-fade-in">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Score History Available</h3>
                <p className="text-gray-600 mb-6">
                  You need at least two resume analyses to see score history. 
                  Re-analyze your resume to track improvements over time.
                </p>
                <button
                  onClick={handleReanalyze}
                  disabled={reanalyzing}
                  className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center mx-auto ${
                    reanalyzing ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {reanalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Re-analyzing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Re-analyze Resume
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeDetail; 