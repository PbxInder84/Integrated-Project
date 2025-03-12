import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useContext(AuthContext);

  useEffect(() => {
    let mounted = true;

    const fetchResumes = async () => {
      if (!user?._id) return;
      
      try {
        setError(null);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/resumes/user`);
        
        if (mounted) {
          const resumesWithScores = await Promise.all(
            res.data.resumes.map(async (resume) => {
              try {
                const scoreRes = await axios.get(`${process.env.REACT_APP_API_URL}/ats/results/${resume._id}`);
                return { ...resume, atsScore: scoreRes.data.atsScore.score };
              } catch {
                return { ...resume, atsScore: null };
              }
            })
          );
          setResumes(resumesWithScores);
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err.response?.data?.message || 'Failed to fetch resumes';
          setError(errorMessage);
          console.error('Dashboard Error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (isAuthenticated && user) {
      fetchResumes();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, user]);

  const handleDeleteResume = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/resumes/${id}`);
        setResumes(resumes.filter(resume => resume._id !== id));
      } catch (err) {
        setError('Failed to delete resume');
        console.error(err);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Please log in to view your dashboard.</p>
        <Link to="/login" className="text-blue-500 hover:text-blue-600 mt-4 inline-block">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link
          to="/upload-resume"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-md"
        >
          Upload New Resume
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Your Resumes</h2>
        </div>

        {resumes.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">You haven't uploaded any resumes yet.</p>
            <Link
              to="/upload-resume"
              className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow-md"
            >
              Upload Your First Resume
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ATS Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resumes.map((resume) => (
                  <tr key={resume._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{resume.filename}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(resume.uploadedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {resume.atsScore !== null ? (
                          <span className="font-semibold">{resume.atsScore}</span>
                        ) : (
                          <span className="text-yellow-500">Not analyzed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/resume-analysis/${resume._id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View Analysis
                      </Link>
                      <button
                        onClick={() => handleDeleteResume(resume._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 