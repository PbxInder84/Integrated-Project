import React from 'react';

const AIAnalysis = ({ aiAnalysis, onRequestAnalysis, loading, error }) => {
  const isRateLimitError = error && (
    error.includes('rate limit') || 
    error.includes('429')
  );

  if (!aiAnalysis && !loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">AI-Powered Resume Analysis</h3>
          <p className="text-gray-600 mb-6">
            Get detailed feedback on your resume from our AI assistant. Identify strengths, weaknesses, and receive personalized recommendations.
          </p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 text-left max-w-md mx-auto">
            <p className="font-medium mb-1">Free Tier Information</p>
            <p className="text-sm mb-2">This feature uses OpenAI's free API tier which has rate limits:</p>
            <ul className="text-sm list-disc pl-5 space-y-1">
              <li>Limited to 1 API request per hour</li>
              <li>Results are cached for 7 days to minimize API usage</li>
              <li>If you've analyzed this resume recently, you'll see cached results</li>
            </ul>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
              <p className="font-bold">Error</p>
              <p>{error}</p>
              {isRateLimitError && (
                <div className="mt-3 text-sm">
                  <p className="font-medium">Rate Limit Information:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Free tier has strict rate limits (typically 3 requests per minute, 200 per day)</li>
                    <li>Our app limits usage to 1 request per hour to avoid exceeding these limits</li>
                    <li>Cached results are used when available (valid for 7 days)</li>
                    <li>Please try again tomorrow or consider upgrading to a paid API plan</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          <button
            onClick={onRequestAnalysis}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium flex items-center mx-auto"
            disabled={isRateLimitError}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate AI Analysis
            {isRateLimitError && " (Try again tomorrow)"}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Generating AI Analysis</h3>
          <p className="text-gray-600 mb-4">
            Our AI is analyzing your resume and generating personalized feedback...
          </p>
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse" style={{ width: '80%' }}></div>
          </div>
          <p className="text-sm text-gray-500 mb-4">This may take up to 30 seconds</p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mt-4 text-left max-w-md mx-auto">
            <p className="font-medium mb-2">About Our Free Tier Rate Limits</p>
            <p className="text-sm">
              We use a 7-day caching system to save previous analyses and limit API calls to once per hour.
              This helps stay within the free OpenAI API limits. If you've analyzed this resume in the last week,
              results will load from cache.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <h3 className="text-white text-xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          AI-Powered Resume Analysis
        </h3>
        {aiAnalysis.lastUpdated && (
          <p className="text-blue-100 text-sm mt-1">
            Generated on {new Date(aiAnalysis.lastUpdated).toLocaleDateString()} at {new Date(aiAnalysis.lastUpdated).toLocaleTimeString()}
            <span className="text-blue-200 ml-1">(Cached for 7 days)</span>
          </p>
        )}
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Key Strengths
            </h4>
            <ul className="space-y-2">
              {aiAnalysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-700 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {aiAnalysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Suggestions
          </h4>
          <ul className="space-y-2 bg-gray-50 p-4 rounded-lg">
            {aiAnalysis.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">●</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Overall Feedback</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 whitespace-pre-line">{aiAnalysis.overallFeedback}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Recommended Target Roles</h4>
          <div className="flex flex-wrap gap-2">
            {aiAnalysis.targetRoles.map((role, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {role}
              </span>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium text-gray-700">Keyword Match</h5>
              <span className="text-sm text-gray-500">Industry Standards</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${aiAnalysis.keywordMatch}%` }}
              ></div>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">0%</span>
              <span className="text-xs font-medium text-blue-700">{aiAnalysis.keywordMatch}%</span>
              <span className="text-xs text-gray-500">100%</span>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium text-gray-700">Readability Score</h5>
              <span className="text-sm text-gray-500">ATS Compatibility</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div 
                className={`h-2.5 rounded-full ${
                  aiAnalysis.readabilityScore >= 70 ? 'bg-green-500' : 
                  aiAnalysis.readabilityScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${aiAnalysis.readabilityScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-gray-500">0%</span>
              <span className={`text-xs font-medium ${
                aiAnalysis.readabilityScore >= 70 ? 'text-green-700' : 
                aiAnalysis.readabilityScore >= 40 ? 'text-yellow-700' : 'text-red-700'
              }`}>{aiAnalysis.readabilityScore}%</span>
              <span className="text-xs text-gray-500">100%</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={onRequestAnalysis}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center mx-auto"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis; 