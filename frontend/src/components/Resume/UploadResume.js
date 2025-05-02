import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [expandedTips, setExpandedTips] = useState({});
  
  const navigate = useNavigate();

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
      
      // Analysis phase with animated messages
      const analysisMessages = [
        "Extracting text from resume...",
        "Identifying skills and qualifications...",
        "Analyzing work experience...",
        "Evaluating education background...",
        "Generating resume score...",
        "Preparing detailed feedback..."
      ];
      
      let messageIndex = 0;
      const analysisInterval = setInterval(() => {
        setProgress(prev => {
          // Simulate slower progress during analysis
          const increment = Math.random() * 5 + 1;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
        
        // Move to next message
        messageIndex = (messageIndex + 1) % analysisMessages.length;
        
        // Stop after a reasonable amount of time if the actual request is taking longer
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Upload Your Resume</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging 
                ? 'border-blue-500 bg-blue-50' 
                : file 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-blue-400'
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
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-700 font-medium">{fileName}</p>
                <p className="text-sm text-gray-500 mt-1">Click to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-700 font-medium">Drag & drop your resume here</p>
                <p className="text-sm text-gray-500 mt-1">Or click to browse files (PDF, DOC, DOCX, TXT)</p>
              </div>
            )}
          </div>
          
          {(uploading || analyzing) && (
            <div className="mt-6">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${analyzing ? 'bg-blue-600 animate-pulse' : 'bg-blue-600'}`}
                  style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
                ></div>
              </div>
              
              <div className="flex items-center justify-center mt-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-center text-gray-700">
                  {uploading ? `Uploading resume... ${Math.round(progress)}%` : `Analyzing resume...`}
                </p>
              </div>
              
              {analyzing && (
                <div className="mt-4 space-y-2">
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-5/6 mx-auto"></div>
                  <div className="h-2 bg-gray-200 rounded animate-pulse w-2/3 mx-auto"></div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={!file || uploading || analyzing}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md ${
                !file || uploading || analyzing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading || analyzing ? 'Processing...' : 'Upload & Analyze'}
            </button>
          </div>
        </form>
      </div>
      
      {/* What to do next section */}
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">What to Do Next?</h3>
        
        <div className="space-y-3">
          {nextStepsTips.map((tip, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                onClick={() => handleTipToggle(index)}
              >
                <span className="font-medium text-gray-800">{tip.title}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedTips[index] ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${expandedTips[index] ? 'max-h-40' : 'max-h-0'}`}>
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700">{tip.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Resume Analysis Process</h4>
          <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
            <li>Your resume is securely processed by our AI analysis engine</li>
            <li>Text is extracted and key information is identified</li>
            <li>Skills, education, and experience are evaluated against industry standards</li>
            <li>Personalized feedback is generated based on industry best practices</li>
            <li>Your resume is scored on content, format, and overall quality</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadResume; 