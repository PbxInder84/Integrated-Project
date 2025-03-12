import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const ResumeAnalysis = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResumeAndScore = async () => {
      try {
        const resumeRes = await axios.get(`${process.env.REACT_APP_API_URL}/resumes/${id}`);
        setResume(resumeRes.data.resume);
        
        try {
          const scoreRes = await axios.get(`${process.env.REACT_APP_API_URL}/ats/results/${id}`);
          if (scoreRes.data.atsScore) {
            setAtsScore(scoreRes.data.atsScore);
          }
        } catch (scoreErr) {
          if (scoreErr.response?.status !== 404) {
            console.error('Error fetching ATS score:', scoreErr);
          }
        }
      } catch (err) {
        setError('Failed to fetch resume details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeAndScore();
  }, [id]);

  const handleReanalyze = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/ats/score/${id}`);
      setAtsScore(res.data.atsScore);
    } catch (err) {
      setError('Failed to reanalyze resume');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading analysis...</div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link to="/dashboard" className="text-blue-500 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/dashboard" className="text-blue-500 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      {resume && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Resume Analysis</h2>
          <div className="mb-4">
            <p className="text-gray-600">Filename: {resume.filename}</p>
            <p className="text-gray-600">Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}</p>
          </div>

          {atsScore ? (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">ATS Score Analysis</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <p className="text-lg font-medium">Score: 
                    <span className={`ml-2 ${
                      atsScore.score >= 80 ? 'text-green-600' :
                      atsScore.score >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {atsScore.score}%
                    </span>
                  </p>
                </div>
                {atsScore.feedback && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Feedback:</h4>
                    <p className="text-gray-700">{atsScore.feedback}</p>
                  </div>
                )}
                {atsScore.skills && atsScore.skills.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Detected Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {atsScore.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-gray-600 mb-4">No ATS analysis available yet.</p>
              <button
                onClick={handleReanalyze}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                disabled={loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysis; 