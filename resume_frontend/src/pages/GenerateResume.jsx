import React, { useState, useEffect } from 'react';
import { 
  FaRobot, 
  FaMagic, 
  FaEraser, 
  FaSpinner, 
  FaFileAlt, 
  FaExternalLinkAlt,
  FaEye,
  FaSignOutAlt,
  FaUser,
  FaCopy,
  FaCheck
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ResumeService from '../api/ResumeService';

const GenerateResume = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [description, setDescription] = useState('');
  const [generatedResume, setGeneratedResume] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedResumeData, setParsedResumeData] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [rawResponse, setRawResponse] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const currentUser = ResumeService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    ResumeService.logout();
    navigate('/');
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError('Please enter a description before generating the resume.');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setGeneratedResume(null);
    setParsedResumeData(null);
    setRawResponse('');
    
    try {
      console.log('Sending description to server:', description);
      
      // Call the generateResume API
      const result = await ResumeService.generateResume(description);
      console.log('Raw result from server:', result);
      
      // Store the raw response as string for display
      setRawResponse(JSON.stringify(result, null, 2));
      
      // Check if result has data property (from our service)
      if (result && result.data) {
        setParsedResumeData(result.data);
        setGeneratedResume(result);
      } 
      // If result is directly the resume data
      else if (result && typeof result === 'object') {
        setParsedResumeData(result);
        setGeneratedResume(result);
      }
      // If result is a string (fallback)
      else if (typeof result === 'string') {
        setGeneratedResume({ rawContent: result });
        setParsedResumeData({ rawContent: result });
      }
      
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to generate resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setDescription('');
    setGeneratedResume(null);
    setParsedResumeData(null);
    setError(null);
    setRawResponse('');
  };

  const handlePreviewResume = () => {
  if (parsedResumeData && !parsedResumeData.rawContent) {
    try {
      // Store the data in sessionStorage
      sessionStorage.setItem('previewResume', JSON.stringify(parsedResumeData));
      console.log('Stored resume data for preview:', parsedResumeData);
      
      // Navigate to preview page
      navigate('/resume-preview');
    } catch (error) {
      console.error('Error storing resume data:', error);
      alert('Failed to prepare resume for preview. Please try again.');
    }
  } else {
    alert('No valid resume data to preview');
  }
};

  const handleOpenInNewTab = () => {
    if (parsedResumeData && !parsedResumeData.rawContent) {
      sessionStorage.setItem('previewResume', JSON.stringify(parsedResumeData));
      window.open('/resume-preview', '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownloadJSON = () => {
    if (parsedResumeData) {
      const dataStr = JSON.stringify(parsedResumeData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `resume-${new Date().toISOString().slice(0,10)}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const handleCopyToClipboard = () => {
    if (parsedResumeData) {
      navigator.clipboard.writeText(JSON.stringify(parsedResumeData, null, 2));
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Function to safely render resume data
  const renderResumeSummary = () => {
    if (!parsedResumeData || parsedResumeData.rawContent) return null;

    try {
      // Handle different possible structures
      const data = parsedResumeData.data || parsedResumeData;
      
      return (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
          <h4 className="font-bold text-lg mb-3 text-gray-800">Resume Summary:</h4>
          <div className="flex flex-wrap gap-2">
            {/* Personal Information */}
            {data.personalInformation?.fullName && (
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
                {data.personalInformation.fullName}
              </span>
            )}
            
            {/* Education */}
            {data.education?.degree?.title && (
              <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm">
                {data.education.degree.title}
              </span>
            )}
            
            {/* Projects */}
            {data.projects?.length > 0 && (
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                {data.projects.length} {data.projects.length === 1 ? 'Project' : 'Projects'}
              </span>
            )}
            
            {/* Work Experience */}
            {data.workExperience?.length > 0 && (
              <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm">
                {data.workExperience.length} {data.workExperience.length === 1 ? 'Position' : 'Positions'}
              </span>
            )}
            
            {/* Skills */}
            {data.skills?.length > 0 && (
              <span className="px-3 py-1 bg-pink-500 text-white rounded-full text-sm">
                {data.skills.length} {data.skills.length === 1 ? 'Skill' : 'Skills'}
              </span>
            )}

            {/* Technical Skills Alternative */}
            {data.technicalSkills?.length > 0 && (
              <span className="px-3 py-1 bg-indigo-500 text-white rounded-full text-sm">
                {data.technicalSkills.length} Technical Skills
              </span>
            )}
          </div>

          {/* Quick preview of key info */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            {data.personalInformation?.email && (
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 text-gray-700">{data.personalInformation.email}</span>
              </div>
            )}
            {data.personalInformation?.phone && (
              <div>
                <span className="text-gray-500">Phone:</span>
                <span className="ml-2 text-gray-700">{data.personalInformation.phone}</span>
              </div>
            )}
          </div>
        </div>
      );
    } catch (err) {
      console.error('Error rendering summary:', err);
      return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex items-center space-x-3">
          <FaSpinner className="animate-spin text-3xl text-blue-600" />
          <span className="text-xl text-gray-600">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <FaRobot className="text-white text-xl" />
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                AI Resume Builder
              </h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-full">
                <FaUser className="text-blue-600" />
                <span className="text-gray-700 font-medium">
                  {user?.fullName || user?.email || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FaMagic className="text-2xl text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Describe Your Experience
              </h2>
            </div>
            
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: I am a Java developer with 5 years of experience in Spring Boot, microservices, and REST APIs. I have worked on e-commerce projects and led a team of 3 developers..."
                className="w-full h-64 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700"
                disabled={isLoading}
              />
              
              <div className="flex space-x-4">
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !description.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin text-xl" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FaMagic className="text-xl" />
                      <span>Generate Resume</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleClear}
                  disabled={isLoading || !description}
                  className="px-6 py-3 border-2 border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:hover:bg-transparent flex items-center space-x-2"
                >
                  <FaEraser className="text-xl" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                💡 Tips for Best Results:
              </h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                <li className="flex items-center">✓ Include job titles and years</li>
                <li className="flex items-center">✓ List technical skills</li>
                <li className="flex items-center">✓ Mention education</li>
                <li className="flex items-center">✓ Describe key projects</li>
                <li className="flex items-center">✓ Include achievements</li>
                <li className="flex items-center">✓ Be specific about roles</li>
              </ul>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <FaFileAlt className="text-2xl text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Generated Resume
              </h2>
            </div>
            
            {generatedResume ? (
              <div className="space-y-6">
                {/* Action Buttons */}
                {parsedResumeData && !parsedResumeData.rawContent && (
                  <>
                    <div className="flex flex-wrap justify-end gap-3">
                      <button
                        onClick={handlePreviewResume}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md"
                      >
                        <FaEye />
                        <span>Preview</span>
                      </button>
                      
                      <button
                        onClick={handleOpenInNewTab}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md"
                      >
                        <FaExternalLinkAlt />
                        <span>New Tab</span>
                      </button>
                      
                      <button
                        onClick={handleDownloadJSON}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md"
                      >
                        <FaFileAlt />
                        <span>Download</span>
                      </button>
                      
                      <button
                        onClick={handleCopyToClipboard}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-md"
                      >
                        {copySuccess ? <FaCheck /> : <FaCopy />}
                        <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Resume Summary */}
                    {renderResumeSummary()}
                  </>
                )}
                
                {/* JSON Preview */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-700">Raw JSON Data</h4>
                    <span className="text-xs text-gray-500">Click to expand/collapse</span>
                  </div>
                  <details className="group" open>
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium mb-2">
                      View JSON
                    </summary>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                      {rawResponse || JSON.stringify(generatedResume, null, 2)}
                    </pre>
                  </details>
                </div>
                
                {/* Raw Content Warning */}
                {parsedResumeData?.rawContent && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-yellow-700 font-medium mb-2">
                      ⚠️ Warning: Raw Text Content Received
                    </p>
                    <p className="text-yellow-600 text-sm mb-3">
                      The AI returned plain text instead of structured JSON. You can still view and download it.
                    </p>
                    <pre className="mt-3 bg-white p-3 rounded-lg border border-yellow-200 max-h-60 overflow-auto text-sm">
                      {parsedResumeData.rawContent}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <div className="text-center">
                  <FaFileAlt className="text-5xl text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">
                    Your generated resume will appear here
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Fill in your experience and click generate
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateResume;