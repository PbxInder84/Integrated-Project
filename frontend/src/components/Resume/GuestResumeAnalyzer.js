import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const GuestResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isVisible, setIsVisible] = useState({});

  // For animation triggering on scroll
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
  
  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!selectedFile) {
      return;
    }
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Only PDF, Word documents (DOC, DOCX), and text files are allowed');
      return;
    }
    
    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size is too large. Maximum allowed size is 10MB');
      return;
    }
    
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setError('');
    
    // Generate preview
    setupPreview(selectedFile);
  };
  
  const setupPreview = (selectedFile) => {
    // Clear previous preview
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setPreviewType(selectedFile.type);
    
    // For text files, read and display as text
    if (selectedFile.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewText(e.target.result);
        setPreviewUrl('');
      };
      reader.readAsText(selectedFile);
    } 
    // For PDF and Word files, create object URL
    else {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setPreviewText('');
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      setError('');
      setAnalysisResult(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('guest', 'true'); // Indicate this is a guest analysis
      
      // Analysis phase with animated messages
      const analysisMessages = [
        "Extracting text from resume...",
        "Identifying skills and qualifications...",
        "Analyzing work experience...",
        "Evaluating education background...",
        "Generating resume score...",
        "Preparing basic feedback..."
      ];
      
      // Upload phase
      await new Promise((resolve) => {
        let uploadProgress = 0;
        const interval = setInterval(() => {
          uploadProgress += 5;
          if (uploadProgress >= 100) {
            clearInterval(interval);
            setUploading(false);
            setAnalyzing(true);
            resolve();
          }
          setProgress(uploadProgress);
        }, 100);
      });
      
      // Cycle through analysis messages
      let messageIndex = 0;
      setCurrentMessage(analysisMessages[0]);
      
      const analysisInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % analysisMessages.length;
        setCurrentMessage(analysisMessages[messageIndex]);
        
        setProgress(prev => {
          // Simulate slower progress during analysis
          const increment = Math.random() * 5 + 1;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 2000);
      
      // Actual API call to ml-service directly (bypass backend)
      const response = await axios.post('http://localhost:5000/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout
      });
      
      // Clear interval after response
      clearInterval(analysisInterval);
      setProgress(100);
      
      // Process the response to only show limited information
      const limitedResult = {
        score: response.data.score,
        skills: response.data.skills ? response.data.skills.slice(0, 8) : [],
        feedback: response.data.feedback ? response.data.feedback.slice(0, 3) : [],
        category_scores: response.data.category_scores ? 
          response.data.category_scores.filter(cat => !cat.includes("AI")) : []
      };
      
      // Delay to simulate processing
      setTimeout(() => {
        setAnalysisResult(limitedResult);
        setAnalyzing(false);
        setProgress(0);
        setCurrentMessage('');
      }, 500);
      
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.error || 'Failed to analyze resume. Please try again.');
      setUploading(false);
      setAnalyzing(false);
      setProgress(0);
      setCurrentMessage('');
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

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white pb-12">
      {/* Decorative elements */}
      <div className="absolute top-20 right-[5%] w-64 h-64 bg-blue-400 opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-[5%] w-48 h-48 bg-indigo-500 opacity-5 rounded-full blur-xl"></div>
      
      {/* Main header */}
      <div className="relative py-8 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white mb-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Guest Resume Analysis</h1>
          <p className="text-blue-100 max-w-2xl">Get a basic analysis of your resume without signing up. Create an account to unlock full details and save your results.</p>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 gap-8">
        {!analysisResult ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Your Resume</h2>
              <p className="text-gray-600 mb-6">Upload your resume to get instant feedback on how it compares to industry standards.</p>
              
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDragging ? 'bg-blue-50 border-blue-500' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <div className="mb-3 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="font-medium text-gray-900">{fileName}</div>
                    <div className="mt-2 flex space-x-3">
                      <button
                        type="button"
                        onClick={handlePreviewToggle}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setFileName('');
                          setShowPreview(false);
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                    
                    {/* File Preview */}
                    {showPreview && (
                      <div className="mt-4 w-full max-h-80 overflow-auto border border-gray-200 rounded">
                        {previewType === 'text/plain' ? (
                          <div className="p-4 whitespace-pre-wrap font-mono text-sm">{previewText}</div>
                        ) : previewType.includes('pdf') ? (
                          <iframe 
                            src={previewUrl} 
                            className="w-full h-80" 
                            title="Resume Preview"
                          />
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            Preview not available for this file type. We'll still be able to analyze it.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="font-medium text-gray-900 mb-1">Drag and drop your resume here</div>
                      <div className="text-sm text-gray-600 mb-3">or click to browse files</div>
                      <div className="text-xs text-gray-500">Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)</div>
                    </div>
                  </label>
                )}
              </div>
              
              {error && (
                <div className="mt-4 text-red-600 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
              
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={handleSubmit}
                  disabled={!file || uploading || analyzing}
                  className={`px-6 py-3 mb-4 sm:mb-0 rounded-lg font-medium ${
                    !file || uploading || analyzing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl'
                  }`}
                >
                  {uploading || analyzing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {analyzing ? 'Analyzing...' : 'Uploading...'}
                    </span>
                  ) : (
                    'Analyze Resume'
                  )}
                </button>
                
                <div className="text-sm text-gray-600">
                  <Link to="/register" className="text-blue-600 hover:underline">
                    Create an account
                  </Link> for full analysis and to save your results
                </div>
              </div>
              
              {/* Progress indicator */}
              {(uploading || analyzing) && (
                <div className="mt-6">
                  <div className="relative pt-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-blue-700">{currentMessage}</div>
                      <div className="text-sm font-medium text-blue-700">{Math.round(progress)}%</div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                      <div
                        style={{ width: `${progress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Analysis Result Section
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Resume Analysis Results</h2>
                <div className="text-sm text-gray-500">
                  Guest Analysis
                </div>
              </div>
              
              {/* Score Summary */}
              <div className="mb-8 p-6 rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-wrap items-center">
                  <div className="w-full md:w-2/5 mb-4 md:mb-0 flex flex-col items-center p-4">
                    <div 
                      className={`text-6xl font-bold mb-2 ${getScoreColor(analysisResult.score)}`}
                    >
                      {analysisResult.score}%
                    </div>
                    <div className="text-gray-600 text-center">
                      <span className="font-medium">Overall Score</span>
                      <p className="text-sm mt-1">This is a basic analysis - create an account for detailed insights</p>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-3/5 pl-0 md:pl-6 md:border-l border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">Category Scores</h4>
                    <div className="space-y-2">
                      {analysisResult.category_scores.slice(0, 3).map((category, index) => {
                        const parts = category.split(':');
                        const categoryName = parts[0];
                        const score = parseInt(parts[1]);
                        
                        return (
                          <div key={index} className="flex items-center">
                            <span className="text-sm text-gray-600 w-40">{categoryName}</span>
                            <div className="flex-1 ml-2">
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${score}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-gray-700">{score}/100</span>
                          </div>
                        );
                      })}
                      {analysisResult.category_scores.length > 3 && (
                        <div className="text-sm text-blue-600 pt-2">
                          <Link to="/register" className="hover:underline">Create an account to view all category scores</Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Key Feedback */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Improvement Areas</h3>
                <div className="space-y-3">
                  {analysisResult.feedback.map((feedback, index) => (
                    <div key={index} className="flex p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                      <div className="flex-shrink-0 text-yellow-500 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-700">{feedback}</p>
                      </div>
                    </div>
                  ))}
                  {analysisResult.feedback.length === 0 && (
                    <p className="text-gray-600">No specific feedback available in guest mode.</p>
                  )}
                  <div className="text-sm text-blue-600 pt-2">
                    <Link to="/register" className="hover:underline">Sign up for comprehensive feedback and improvement suggestions</Link>
                  </div>
                </div>
              </div>
              
              {/* Skills Detected */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills Detected</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                  {analysisResult.skills.length === 0 && (
                    <p className="text-gray-600">No skills detected in your resume.</p>
                  )}
                </div>
                <div className="text-sm text-blue-600 pt-4">
                  <Link to="/register" className="hover:underline">Create an account to see all detected skills and more details</Link>
                </div>
              </div>
              
              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white mb-6">
                <h3 className="text-xl font-bold mb-2">Unlock Full Analysis</h3>
                <p className="mb-4">Create a free account to get complete insights, save your results, and track improvements over time.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link 
                    to="/register" 
                    className="px-6 py-2 bg-white text-blue-700 font-medium rounded hover:bg-blue-50 transition-colors text-center"
                  >
                    Sign Up Now
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-6 py-2 border border-white text-white font-medium rounded hover:bg-blue-700 transition-colors text-center"
                  >
                    Login
                  </Link>
                </div>
              </div>
              
              {/* Analyze Another Resume */}
              <div className="text-center">
                <button
                  onClick={() => {
                    setAnalysisResult(null);
                    setFile(null);
                    setFileName('');
                    setShowPreview(false);
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Analyze Another Resume
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestResumeAnalyzer; 