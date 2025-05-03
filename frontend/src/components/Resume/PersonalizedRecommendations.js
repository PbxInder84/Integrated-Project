import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PersonalizedRecommendations = ({ resumeData, resumeId }) => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [selectedArea, setSelectedArea] = useState('all');
  const [generatingBullet, setGeneratingBullet] = useState(false);
  const [bulletPoint, setBulletPoint] = useState('');
  const [improvedBullet, setImprovedBullet] = useState('');

  // Areas that can be improved in a resume
  const improvementAreas = [
    { id: 'all', label: 'All Areas' },
    { id: 'experience', label: 'Work Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'projects', label: 'Projects' },
    { id: 'summary', label: 'Professional Summary' },
  ];

  useEffect(() => {
    if (resumeId) {
      fetchRecommendations();
    }
  }, [resumeId]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call to backend API to get personalized recommendations
      const response = await axios.get(`/api/resumes/${resumeId}/recommendations`);
      setRecommendations(response.data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load personalized recommendations. Please try again.');
      
      // For demo purposes, set some sample recommendations if the API call fails
      setRecommendations({
        weakAreas: [
          {
            area: 'experience',
            recommendations: [
              'Use more action verbs at the beginning of bullet points',
              'Include quantifiable achievements (e.g., increased sales by 20%)',
              'Match keywords from the job descriptions you're targeting'
            ]
          },
          {
            area: 'skills',
            recommendations: [
              'Add more technical skills relevant to your industry',
              'Organize skills by categories (technical, soft, domain)',
              'Remove outdated or irrelevant skills'
            ]
          },
          {
            area: 'summary',
            recommendations: [
              'Keep your summary concise (3-5 sentences)',
              'Highlight your most impressive achievements',
              'Include your years of experience and specialization'
            ]
          }
        ],
        keywords: [
          'data analysis',
          'project management',
          'stakeholder communication',
          'agile methodology',
          'cross-functional collaboration'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImproveText = async () => {
    if (!bulletPoint.trim()) return;
    
    setGeneratingBullet(true);
    setError(null);
    
    try {
      // Call to backend API to improve bullet point
      const response = await axios.post('/api/improve-text', {
        text: bulletPoint,
        type: 'bullet_point',
        context: resumeData
      });
      
      setImprovedBullet(response.data.improved_text);
    } catch (err) {
      console.error('Error improving bullet point:', err);
      setError('Failed to generate improved text. Please try again.');
      
      // For demo purposes, generate an improved bullet
      const demoImprovedBullets = {
        "Managed a team of developers": "Led a cross-functional team of 8 developers, resulting in successful delivery of 5 key projects ahead of schedule and 15% under budget",
        "Worked on database optimization": "Optimized database performance by redesigning query structures, reducing response time by 40% and improving user experience for 10,000+ daily users",
        "Helped with customer service issues": "Resolved 95% of complex customer service issues within 24 hours, increasing customer satisfaction scores from 3.7 to 4.8/5.0",
        "Created reports": "Developed automated reporting system that consolidated data from 5 sources, saving 15 hours weekly and improving decision-making accuracy by 30%",
        "Participated in project planning": "Spearheaded project planning initiatives that streamlined workflow processes, resulting in 25% reduction in project delivery timelines"
      };
      
      const keys = Object.keys(demoImprovedBullets);
      let closestMatch = keys[0];
      
      for (const key of keys) {
        // Find something that somewhat matches what the user entered
        if (bulletPoint.toLowerCase().includes(key.toLowerCase().substring(0, 5))) {
          closestMatch = key;
          break;
        }
      }
      
      setImprovedBullet(demoImprovedBullets[closestMatch]);
    } finally {
      setGeneratingBullet(false);
    }
  };

  // Filter recommendations based on selected area
  const filteredRecommendations = recommendations?.weakAreas.filter(
    item => selectedArea === 'all' || item.area === selectedArea
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Personalized Recommendations</h2>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          <p>{error}</p>
          <button
            onClick={fetchRecommendations}
            className="mt-2 text-sm font-medium text-red-700 hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      ) : recommendations ? (
        <div>
          {/* Area filter tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {improvementAreas.map(area => (
              <button
                key={area.id}
                onClick={() => setSelectedArea(area.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedArea === area.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {area.label}
              </button>
            ))}
          </div>
          
          {/* Recommendations by area */}
          <div className="space-y-6 mb-8">
            {filteredRecommendations.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-1">
                <h3 className="text-lg font-semibold text-gray-800 capitalize mb-2">
                  {improvementAreas.find(area => area.id === item.area)?.label || item.area}
                </h3>
                <ul className="space-y-2">
                  {item.recommendations.map((rec, recIndex) => (
                    <li key={recIndex} className="flex items-start">
                      <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          {/* Industry-specific keywords */}
          <div className="mt-8 bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Suggested Industry Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {recommendations.keywords.map((keyword, index) => (
                <span 
                  key={index} 
                  className="bg-white text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                  title="Click to copy"
                  onClick={() => {
                    navigator.clipboard.writeText(keyword);
                    // Could add a small toast notification here
                  }}
                >
                  {keyword}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Click on a keyword to copy it to your clipboard
            </p>
          </div>
          
          {/* Bullet point improver */}
          <div className="mt-8 border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Improve Your Bullet Points
            </h3>
            <div>
              <label htmlFor="bullet-input" className="block text-sm font-medium text-gray-700 mb-1">
                Enter a bullet point from your resume:
              </label>
              <textarea
                id="bullet-input"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="e.g., Managed a team of developers"
                value={bulletPoint}
                onChange={(e) => setBulletPoint(e.target.value)}
              ></textarea>
              
              <button
                onClick={handleImproveText}
                disabled={!bulletPoint.trim() || generatingBullet}
                className={`mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  !bulletPoint.trim() || generatingBullet
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {generatingBullet ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Improving...
                  </>
                ) : (
                  'Improve This Bullet Point'
                )}
              </button>
              
              {improvedBullet && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Improved Version:
                  </label>
                  <div className="relative">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-gray-800">
                      {improvedBullet}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(improvedBullet);
                        // Could add a small toast notification here
                      }}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002-2h2a2 2 0 002 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    This improved bullet point highlights your specific achievements and uses strong action verbs.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No resume data available for recommendations.</p>
          <button
            onClick={fetchRecommendations}
            className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Generate Recommendations
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalizedRecommendations; 