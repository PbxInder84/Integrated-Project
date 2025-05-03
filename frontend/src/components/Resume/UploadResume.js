import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const UploadResume = ({ user }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [expandedTips, setExpandedTips] = useState({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVisible, setIsVisible] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState('');
  const [previewText, setPreviewText] = useState('');
  
  const navigate = useNavigate();

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
  
  const handleTipToggle = (index) => {
    setExpandedTips(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
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
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Analysis phase with animated messages
      const analysisMessages = [
        "Extracting text from resume...",
        "Identifying skills and qualifications...",
        "Analyzing work experience...",
        "Evaluating education background...",
        "Generating resume score...",
        "Preparing detailed feedback..."
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
      
      // Actual API call
      const response = await axios.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000 // 30 second timeout
      });
      
      // Clear interval and redirect after response
      clearInterval(analysisInterval);
      setProgress(100);
      
      // Brief delay before redirect to show 100% completion
      setTimeout(() => {
        navigate(`/resume/${response.data.id}`);
      }, 500);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Failed to upload resume. Please try again.');
      setUploading(false);
      setAnalyzing(false);
      setProgress(0);
      setCurrentMessage('');
    }
  };
  
  const nextStepsTips = [
    {
      title: "How can I improve my resume score?",
      content: "Focus on quantifiable achievements, use action verbs, customize for each job application, include relevant keywords from job descriptions, and ensure proper formatting with consistent styles."
    },
    {
      title: "What should I do after receiving my resume analysis?",
      content: "Review all feedback carefully, prioritize fixing critical issues first, add missing information, update your skills section, and consider having a professional review your updated resume."
    },
    {
      title: "How often should I update my resume?",
      content: "Update your resume after major accomplishments, learning new skills, job changes, or every 6 months even if you're not actively job hunting to keep it current."
    },
    {
      title: "Can I use my analyzed resume for different job applications?",
      content: "While your analyzed resume provides a solid foundation, always tailor it for specific job applications by emphasizing relevant skills and experiences that match the job description."
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white pb-12">
      {/* Decorative elements */}
      <div className="absolute top-20 right-[5%] w-64 h-64 bg-blue-400 opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 left-[5%] w-48 h-48 bg-indigo-500 opacity-5 rounded-full blur-xl"></div>
      
      {/* Main header */}
      <div className="relative py-8 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white mb-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Resume Upload & Analysis</h1>
          <p className="text-blue-100 max-w-2xl">Get detailed feedback and insights to improve your resume and increase your chances of landing interviews.</p>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left column - Upload section */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Progress indicator at top */}
            {(uploading || analyzing) && (
              <div className="w-full h-1.5 bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Upload Your Resume</h2>
                {user && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <div className="h-7 w-7 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white font-medium text-xs">{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span>{user.name}</span>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 animate-slide-up">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                {/* Upload area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50 scale-105' 
                      : file 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('resume-file').click()}
                >
                  <input
                    type="file"
                    id="resume-file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                  />
                  
                  {file ? (
                    <div className="py-6">
                      <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">File Ready for Upload</h3>
                      <p className="text-gray-700 font-medium mb-1">{fileName}</p>
                      <p className="text-sm text-gray-500 mb-3">Click to change file</p>
                      
                      {/* Preview button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviewToggle();
                        }}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview Resume
                      </button>
                    </div>
                  ) : (
                    <div className="py-10">
                      <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center animate-pulse-shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Drag & drop your resume here</h3>
                      <p className="text-gray-600 mb-4">Or click to browse files</p>
                      <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">.PDF</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">.DOC</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">.DOCX</span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">.TXT</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Processing state */}
                {(uploading || analyzing) && (
                  <div className="mt-8 py-6 px-6 bg-blue-50 rounded-xl border border-blue-100 animate-fade-in">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4">
                        <div className="w-10 h-10 rounded-full border-4 border-t-blue-600 border-blue-200 animate-spin"></div>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">
                        {uploading ? 'Uploading Resume' : 'Analyzing Resume'}
                      </h3>
                      <p className="text-gray-600">{uploading ? `${Math.round(progress)}% complete` : currentMessage}</p>
                    </div>
                    
                    {/* Progress visualization */}
                    <div className="w-full h-2 bg-white rounded-full mb-3">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    
                    {/* Analysis animation */}
                    {analyzing && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {[...Array(6)].map((_, i) => (
                          <div 
                            key={i} 
                            className="h-2 bg-blue-200 rounded animate-pulse" 
                            style={{ 
                              width: `${Math.floor(Math.random() * 40) + 60}%`,
                              animationDelay: `${i * 0.15}s`
                            }}
                          ></div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Upload button */}
                <div className="flex justify-center mt-8">
                  <button
                    type="submit"
                    disabled={!file || uploading || analyzing}
                    className={`flex items-center justify-center w-full sm:w-auto px-8 py-3 text-base font-medium rounded-xl transition-all ${
                      !file || uploading || analyzing 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-lg hover:scale-105'
                    }`}
                  >
                    {uploading || analyzing ? (
                      'Processing...'
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Analyze My Resume
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Right column - Tips & Info */}
        <div className="md:col-span-2">
          <div id="info-section" className="animate-on-scroll">
            {/* Resume Analysis Process */}
            <div className={`bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg mb-8 overflow-hidden transition-all duration-500 ${isVisible['info-section'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">How We Analyze Your Resume</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center mt-0.5 mr-3">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-100">Document Processing</h4>
                      <p className="text-sm text-blue-100 opacity-90">Your resume is securely uploaded and text is extracted</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center mt-0.5 mr-3">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-100">AI Analysis</h4>
                      <p className="text-sm text-blue-100 opacity-90">Our advanced AI identifies key information and evaluates content</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center mt-0.5 mr-3">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-100">Industry Comparison</h4>
                      <p className="text-sm text-blue-100 opacity-90">Your resume is compared to industry standards and best practices</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 bg-opacity-30 flex items-center justify-center mt-0.5 mr-3">
                      <span className="text-sm font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-100">Personalized Feedback</h4>
                      <p className="text-sm text-blue-100 opacity-90">Detailed recommendations to help you improve your resume</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Resume Tips Accordion */}
            <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 ${isVisible['info-section'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`} style={{ transitionDelay: '0.2s' }}>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Resume Improvement Tips</h3>
                <div className="space-y-3">
                  {nextStepsTips.map((tip, index) => (
                    <div 
                      key={index} 
                      className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
                    >
                      <button 
                        className="w-full p-4 text-left flex justify-between items-center transition-colors hover:bg-gray-50"
                        onClick={() => handleTipToggle(index)}
                        aria-expanded={expandedTips[index]}
                      >
                        <span className="font-medium text-gray-800">{tip.title}</span>
                        <div className={`w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center transition-transform duration-300 ${expandedTips[index] ? 'rotate-180 bg-blue-100' : ''}`}>
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className={`h-4 w-4 ${expandedTips[index] ? 'text-blue-600' : 'text-gray-500'}`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      
                      <div className={`overflow-hidden transition-all duration-300 ${expandedTips[index] ? 'max-h-72' : 'max-h-0'}`}>
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-700">{tip.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-t border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">Need More Help?</h4>
                    <p className="text-sm text-gray-600">Check out our guides for expert resume advice</p>
                  </div>
                  <Link 
                    to="/resources" 
                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-blue-600 text-sm font-medium hover:bg-blue-50 transition-colors"
                  >
                    View Resources
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resume Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resume Preview: {fileName}
              </h3>
              <button 
                onClick={handlePreviewToggle}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {/* PDF Preview */}
              {previewType === 'application/pdf' && previewUrl && (
                <div className="w-full h-full min-h-[500px]">
                  <iframe 
                    src={previewUrl} 
                    title="PDF Preview" 
                    className="w-full h-full border-0"
                  ></iframe>
                </div>
              )}
              
              {/* Text Preview */}
              {previewType === 'text/plain' && previewText && (
                <div className="bg-gray-50 p-6 rounded-lg font-mono text-sm overflow-auto max-h-[600px] whitespace-pre-wrap">
                  {previewText}
                </div>
              )}
              
              {/* Word Document Preview */}
              {(previewType === 'application/msword' || previewType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-medium text-gray-800 mb-2">Word Document Preview</h4>
                  <p className="text-gray-600 mb-6">Word documents can't be previewed directly in the browser</p>
                  
                  <a 
                    href={previewUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    download={fileName}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Document
                  </a>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={handlePreviewToggle}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadResume; 