import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchResumeDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/resume/${id}`);
        setResume(res.data);
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || 'Resume not found'}
        </div>
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
          &larr; Back to Dashboard
        </Link>
        <div className="flex space-x-3">
          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className={`bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm flex items-center ${reanalyzing ? 'opacity-70 cursor-not-allowed' : ''}`}
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Re-analyze Resume
              </>
            )}
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
          >
            Delete Resume
          </button>
        </div>
      </div>

      {reanalyzing && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <p className="font-medium text-gray-700 mb-2">Re-analyzing your resume with our AI engine...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${reanalyzeProgress}%`, transition: 'width 0.3s ease' }}
            ></div>
          </div>
          <div className="mt-3 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <div className="text-sm text-gray-600">
              Extracting information, analyzing content, and generating feedback...
            </div>
          </div>
        </div>
      )}

      {showScoreChange && scoreImprovement !== null && (
        <div className={`mb-6 p-4 rounded-lg shadow-md transition-all duration-500 ${
          scoreImprovement > 0 
            ? 'bg-green-50 border-l-4 border-green-500' 
            : scoreImprovement < 0 
              ? 'bg-yellow-50 border-l-4 border-yellow-500' 
              : 'bg-blue-50 border-l-4 border-blue-500'
        }`}>
          <div className="flex items-center">
            {scoreImprovement > 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : scoreImprovement < 0 ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div>
              <p className="font-medium">
                {scoreImprovement > 0 
                  ? `Your resume score improved by ${scoreImprovement.toFixed(1)}%!` 
                  : scoreImprovement < 0 
                    ? `Your resume score decreased by ${Math.abs(scoreImprovement).toFixed(1)}%.` 
                    : 'Your resume score remained the same.'}
              </p>
              <p className="text-sm mt-1">
                {scoreImprovement > 0 
                  ? 'Great job! The changes you made have had a positive impact.' 
                  : scoreImprovement < 0 
                    ? 'Consider reviewing the feedback below to improve your score.' 
                    : 'Consider making additional improvements based on the feedback below.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{resume.fileName}</h2>
              <p className="text-gray-600 mt-1">
                Uploaded on {new Date(resume.uploadDate).toLocaleDateString()}
                {resume.lastAnalyzed && resume.lastAnalyzed !== resume.uploadDate && (
                  <span className="ml-2 text-blue-600">
                    (Last analyzed: {new Date(resume.lastAnalyzed).toLocaleDateString()})
                  </span>
                )}
              </p>
            </div>
            
            <div className={`${getScoreBackground(resume.analysis.score)} p-4 rounded-lg text-center`}>
              <div className="text-3xl font-bold mb-1 flex justify-center">
                <span className={getScoreColor(resume.analysis.score)}>
                  {resume.analysis.score}%
                </span>
              </div>
              <div className="text-sm font-medium">{getScoreDescription(resume.analysis.score)}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Personal Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{resume.parseData.name || 'Not detected'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{resume.parseData.email || 'Not detected'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{resume.parseData.phone || 'Not detected'}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {resume.parseData.skills && resume.parseData.skills.length > 0 ? (
                  resume.parseData.skills.map((skill, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills detected</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Education</h3>
            <div className="space-y-2">
              {resume.parseData.education && resume.parseData.education.length > 0 ? (
                resume.parseData.education.map((edu, idx) => (
                  <p key={idx} className="text-gray-700 p-2 bg-gray-50 rounded">
                    {edu}
                  </p>
                ))
              ) : (
                <p className="text-gray-500">No education details detected</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Feedback & Suggestions</h3>
            <div className="space-y-2">
              {resume.analysis.feedback && resume.analysis.feedback.length > 0 ? (
                resume.analysis.feedback.map((feedback, idx) => (
                  <div key={idx} className="flex items-start p-2 bg-yellow-50 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feedback}</span>
                  </div>
                ))
              ) : (
                <p className="text-green-600 bg-green-50 p-2 rounded">
                  No improvement suggestions. Great job!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">What to do next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-400 hover:scale-105 transform cursor-pointer group">
            <div className="text-blue-600 mb-3 group-hover:text-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Update your resume</h4>
            <p className="text-gray-600 text-sm">Apply the feedback suggestions to improve your resume's content, formatting, and impact.</p>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-400 hover:scale-105 transform cursor-pointer group">
            <div className="text-blue-600 mb-3 group-hover:text-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Re-upload for analysis</h4>
            <p className="text-gray-600 text-sm">
              <Link to="/upload" className="text-blue-600 hover:text-blue-800">Upload your revised resume</Link> to see if your score improves.
            </p>
          </div>
          
          <div className="border rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-400 hover:scale-105 transform cursor-pointer group">
            <div className="text-blue-600 mb-3 group-hover:text-blue-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Research job opportunities</h4>
            <p className="text-gray-600 text-sm">Use your improved resume to apply for positions that match your skills and experience.</p>
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-5">
          <h4 className="font-medium text-gray-800 mb-3">Key improvement tips based on your score:</h4>
          <div className="space-y-3">
            {resume.analysis.score < 70 && (
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700">Focus on adding more <span className="font-medium">quantifiable achievements</span> to your work experience.</p>
              </div>
            )}
            
            {resume.analysis.score < 80 && (
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700">Ensure your <span className="font-medium">skills section</span> includes both technical and soft skills relevant to your field.</p>
              </div>
            )}
            
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-700">Tailor your resume for each job application by matching keywords from the job description.</p>
            </div>
            
            {resume.analysis.score < 90 && (
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700">Use <span className="font-medium">action verbs</span> and a consistent tense throughout your resume.</p>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Link 
              to="/upload" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group"
            >
              Upload revised resume
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {resume.analysisHistory && resume.analysisHistory.length > 1 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Score History
            </span>
          </h3>
          
          <div className="mt-4">
            <div className="flex items-end space-x-2 overflow-x-auto pb-2">
              {resume.analysisHistory.map((entry, index) => {
                const heightPercentage = Math.max(entry.score, 10);
                const barHeight = heightPercentage;
                
                let barColor = 'bg-red-400';
                if (entry.score >= 80) barColor = 'bg-green-400';
                else if (entry.score >= 60) barColor = 'bg-yellow-400';
                
                return (
                  <div key={index} className="flex flex-col items-center" style={{ minWidth: '60px' }}>
                    <div 
                      className={`${barColor} rounded-t-md w-10 hover:opacity-80 transition-opacity cursor-pointer relative group`} 
                      style={{ height: `${barHeight}px` }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Score: {entry.score}%
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    {index === 0 && (
                      <div className="text-xs font-medium text-gray-600 mt-1">Initial</div>
                    )}
                    {index === resume.analysisHistory.length - 1 && index !== 0 && (
                      <div className="text-xs font-medium text-gray-600 mt-1">Latest</div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>
                {resume.analysisHistory.length > 1 ? (
                  <>
                    You've analyzed this resume {resume.analysisHistory.length} times. 
                    {resume.analysisHistory[resume.analysisHistory.length - 1].score > resume.analysisHistory[0].score ? (
                      <span className="text-green-600 font-medium"> Your score has improved by {(resume.analysisHistory[resume.analysisHistory.length - 1].score - resume.analysisHistory[0].score).toFixed(1)}% since the first analysis.</span>
                    ) : resume.analysisHistory[resume.analysisHistory.length - 1].score < resume.analysisHistory[0].score ? (
                      <span className="text-red-600 font-medium"> Your score has decreased by {(resume.analysisHistory[0].score - resume.analysisHistory[resume.analysisHistory.length - 1].score).toFixed(1)}% since the first analysis.</span>
                    ) : (
                      <span className="text-gray-600 font-medium"> Your score has remained the same since the first analysis.</span>
                    )}
                  </>
                ) : (
                  'This is the first analysis of your resume. Re-analyze after making improvements to track your progress.'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Section */}
      {resume && resume.status === 'processed' && (
        <AIAnalysis 
          aiAnalysis={resume.aiAnalysis} 
          onRequestAnalysis={handleRequestAIAnalysis} 
          loading={aiAnalysisLoading}
          error={error}
        />
      )}
    </div>
  );
};

export default ResumeDetail; 