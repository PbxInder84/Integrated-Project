import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Settings = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      resume_analysis: true,
      job_matches: false,
      marketing: false
    },
    appearance: {
      theme: 'light',
      compact_view: false
    },
    privacy: {
      share_data: true,
      anonymous_analytics: true
    },
    integrations: {
      linkedin: false,
      indeed: false,
      google: false
    }
  });

  // Simulated fetch of user settings
  useEffect(() => {
    // In a real app, you would fetch user settings from the backend
    // For now, we'll use the default settings defined above
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
    
    // Clear any previous messages
    setSuccess(false);
    setError('');
  };

  const handleRadioChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    
    // Clear any previous messages
    setSuccess(false);
    setError('');
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, you would send the settings to the backend
      // const response = await axios.put('/user/settings', settings);
      
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle switch component
  const Switch = ({ checked, onChange }) => {
    return (
      <div 
        onClick={onChange}
        className={`relative inline-block w-10 h-5 transition-colors duration-300 ease-in-out rounded-full cursor-pointer ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span 
          className={`absolute left-0.5 top-0.5 w-4 h-4 transition-transform duration-300 ease-in-out transform bg-white rounded-full ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        ></span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <p className="text-gray-600 mt-1">Manage your app preferences and account settings</p>
        </div>
        
        {loading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {!loading && (
          <div className="p-6">
            {success && (
              <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <p>{success}</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <div className="flex items-center">
                  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-10">
              {/* Notification Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.email} 
                      onChange={() => handleToggle('notifications', 'email')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Browser Notifications</h4>
                      <p className="text-sm text-gray-600">Receive in-app notifications</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.browser} 
                      onChange={() => handleToggle('notifications', 'browser')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Resume Analysis Updates</h4>
                      <p className="text-sm text-gray-600">Get notified when your resume analysis is complete</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.resume_analysis} 
                      onChange={() => handleToggle('notifications', 'resume_analysis')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Job Match Alerts</h4>
                      <p className="text-sm text-gray-600">Get notified about potential job matches</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.job_matches} 
                      onChange={() => handleToggle('notifications', 'job_matches')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Marketing & Promotions</h4>
                      <p className="text-sm text-gray-600">Receive marketing emails and special offers</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.marketing} 
                      onChange={() => handleToggle('notifications', 'marketing')} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Appearance Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Appearance</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Theme</h4>
                    <div className="flex space-x-4">
                      <div 
                        className={`flex items-center px-4 py-2 border rounded-md cursor-pointer ${
                          settings.appearance.theme === 'light' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-300 text-gray-700'
                        }`}
                        onClick={() => handleRadioChange('appearance', 'theme', 'light')}
                      >
                        <div className={`w-4 h-4 rounded-full mr-2 ${
                          settings.appearance.theme === 'light' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <span>Light</span>
                      </div>
                      
                      <div 
                        className={`flex items-center px-4 py-2 border rounded-md cursor-pointer ${
                          settings.appearance.theme === 'dark' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-300 text-gray-700'
                        }`}
                        onClick={() => handleRadioChange('appearance', 'theme', 'dark')}
                      >
                        <div className={`w-4 h-4 rounded-full mr-2 ${
                          settings.appearance.theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <span>Dark</span>
                      </div>
                      
                      <div 
                        className={`flex items-center px-4 py-2 border rounded-md cursor-pointer ${
                          settings.appearance.theme === 'system' 
                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                            : 'border-gray-300 text-gray-700'
                        }`}
                        onClick={() => handleRadioChange('appearance', 'theme', 'system')}
                      >
                        <div className={`w-4 h-4 rounded-full mr-2 ${
                          settings.appearance.theme === 'system' ? 'bg-blue-500' : 'bg-gray-300'
                        }`}></div>
                        <span>System Default</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Compact View</h4>
                      <p className="text-sm text-gray-600">Use a more compact layout throughout the app</p>
                    </div>
                    <Switch 
                      checked={settings.appearance.compact_view} 
                      onChange={() => handleToggle('appearance', 'compact_view')} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Privacy Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Privacy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Data Sharing</h4>
                      <p className="text-sm text-gray-600">Allow us to use your data to improve our services</p>
                    </div>
                    <Switch 
                      checked={settings.privacy.share_data} 
                      onChange={() => handleToggle('privacy', 'share_data')} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-800">Anonymous Analytics</h4>
                      <p className="text-sm text-gray-600">Contribute anonymous usage data for analytics</p>
                    </div>
                    <Switch 
                      checked={settings.privacy.anonymous_analytics} 
                      onChange={() => handleToggle('privacy', 'anonymous_analytics')} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Integrations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Integrations</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 11V17M8 7V8M12 11V17M12 7V8M16 11V17M16 7V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">LinkedIn</h4>
                        <p className="text-sm text-gray-600">Connect to import profile data and job listings</p>
                      </div>
                    </div>
                    <div>
                      {!settings.integrations.linkedin ? (
                        <button className="px-4 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                          Connect
                        </button>
                      ) : (
                        <button className="px-4 py-1 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50">
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5M21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5M21 5L12 12L3 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Indeed</h4>
                        <p className="text-sm text-gray-600">Connect to access job listings from Indeed</p>
                      </div>
                    </div>
                    <div>
                      {!settings.integrations.indeed ? (
                        <button className="px-4 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                          Connect
                        </button>
                      ) : (
                        <button className="px-4 py-1 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50">
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 19C13.4183 19 17 15.4183 17 11C17 6.58172 13.4183 3 9 3C4.58172 3 1 6.58172 1 11C1 15.4183 4.58172 19 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M23 23L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Google</h4>
                        <p className="text-sm text-gray-600">Connect to sync with Google Drive and Calendar</p>
                      </div>
                    </div>
                    <div>
                      {!settings.integrations.google ? (
                        <button className="px-4 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50">
                          Connect
                        </button>
                      ) : (
                        <button className="px-4 py-1 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50">
                          Disconnect
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveSettings}
                  className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-all duration-300 ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Settings...
                    </div>
                  ) : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings; 