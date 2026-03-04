import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartLine, 
  FaBullseye, 
  FaLightbulb, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaArrowRight,
  FaSpinner,
  FaFileAlt,
  FaRocket,
  FaDownload,
  FaRedo
} from 'react-icons/fa';
import ResumeService from '../api/ResumeService';

const ResumeAnalysis = () => {
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [experience, setExperience] = useState('');
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const data = await ResumeService.getResumeHistory();
      setResumes(data || []);
      if (data && data.length > 0) {
        setSelectedResumeId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!jobTitle.trim()) {
      setError('Please enter a target job title');
      return;
    }

    if (!selectedResumeId) {
      setError('Please select a resume to analyze');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const request = {
        jobTitle: jobTitle,
        jobDescription: jobDescription,
        industry: industry,
        experience: experience,
        resumeId: selectedResumeId
      };

      const result = await ResumeService.analyzeResumeForJob(request);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setJobTitle('');
    setJobDescription('');
    setIndustry('');
    setExperience('');
    setError('');
  };

  const getPriorityColor = (priority) => {
    if (!priority) return 'bg-gray-100 text-gray-800 border-gray-200';
    const upperPriority = priority.toUpperCase();
    switch(upperPriority) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadge = (priority) => {
    if (!priority) return 'bg-gray-500';
    const upperPriority = priority.toUpperCase();
    switch(upperPriority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getMatchColor = (percentage) => {
    if (!percentage && percentage !== 0) return 'text-gray-600';
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchBgColor = (percentage) => {
    if (!percentage && percentage !== 0) return 'bg-gray-100';
    if (percentage >= 80) return 'bg-green-100';
    if (percentage >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const downloadAnalysis = () => {
    if (!analysis) return;
    
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const fileName = analysis.jobTitle 
      ? `job-match-${analysis.jobTitle.replace(/\s+/g, '-').toLowerCase()}.json`
      : 'job-analysis.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
  };

  // Safe array access helper
  const safeArray = (arr) => {
    return Array.isArray(arr) ? arr : [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <FaChartLine className="mr-3 text-blue-600" />
                Resume Job Match Analysis
              </h1>
              <p className="text-gray-600 mt-2">
                Get AI-powered suggestions to optimize your resume for specific job roles
              </p>
            </div>
            {analysis && (
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                <FaRedo />
                <span>New Analysis</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!analysis ? (
          /* Input Form */
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <FaBullseye className="mr-3 text-blue-600" />
                Target Job Details
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    {error}
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {/* Resume Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Resume to Analyze *
                  </label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Choose a resume...</option>
                    {safeArray(resumes).map(resume => (
                      <option key={resume?.id || Math.random()} value={resume?.id}>
                        {resume?.title || 'Untitled'} - {resume?.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'Unknown date'}
                      </option>
                    ))}
                  </select>
                  {resumes.length === 0 && (
                    <p className="mt-2 text-sm text-yellow-600">
                      No resumes found. Please generate a resume first.
                    </p>
                  )}
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior Java Developer"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Industry & Experience - 2 column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g., FinTech, E-commerce"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years Experience Required
                    </label>
                    <input
                      type="text"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g., 3-5 years"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description (Optional - paste for better analysis)
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Analyze Button */}
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !jobTitle || !selectedResumeId}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center space-x-3 text-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Analyzing Your Resume...</span>
                    </>
                  ) : (
                    <>
                      <FaRocket />
                      <span>Analyze Resume</span>
                    </>
                  )}
                </button>
              </div>

              {/* Tips Section */}
              <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <FaLightbulb className="mr-2" />
                  Tips for Best Results
                </h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Be specific with job titles (e.g., "Senior Java Developer" not just "Developer")</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Include the full job description for more accurate analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Use your most recent/updated resume for best results</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Match Score Card */}
            <div className={`${getMatchBgColor(analysis?.matchPercentage)} rounded-2xl shadow-lg p-8`}>
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Job Match Analysis: {analysis?.jobTitle || 'Unknown Job'}
                  </h2>
                  <p className="text-gray-700">{analysis?.overallAssessment || 'No assessment available'}</p>
                </div>
                <div className="text-center mt-4 md:mt-0">
                  <div className={`text-6xl font-bold ${getMatchColor(analysis?.matchPercentage)}`}>
                    {analysis?.matchPercentage ?? 0}%
                  </div>
                  <p className="text-gray-600 mt-2">Match Score</p>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {['overview', 'skills', 'experience', 'keywords', 'actions'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 px-1 text-center font-medium text-sm capitalize transition ${
                        activeTab === tab
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Skills Overview */}
                    {(safeArray(analysis?.matchingSkills).length > 0 || safeArray(analysis?.missingCriticalSkills).length > 0) && (
                      <div>
                        <h3 className="text-lg font-bold mb-4">Skills Analysis</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {safeArray(analysis?.matchingSkills).length > 0 && (
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <p className="font-medium text-green-800 mb-3 flex items-center">
                                <FaCheckCircle className="mr-2" /> Matching Skills
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {safeArray(analysis?.matchingSkills).map((skill, i) => (
                                  <span key={i} className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {safeArray(analysis?.missingCriticalSkills).length > 0 && (
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                              <p className="font-medium text-red-800 mb-3 flex items-center">
                                <FaTimesCircle className="mr-2" /> Missing Critical Skills
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {safeArray(analysis?.missingCriticalSkills).map((skill, i) => (
                                  <span key={i} className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Experience Overview */}
                    {safeArray(analysis?.experienceGaps).length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-4">Experience Analysis</h3>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="font-medium text-yellow-800 mb-3">Experience Gaps</p>
                          <ul className="space-y-2">
                            {safeArray(analysis?.experienceGaps).map((gap, i) => (
                              <li key={i} className="flex items-start text-yellow-700">
                                <FaExclamationTriangle className="mr-2 mt-1 flex-shrink-0" />
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Format Suggestions */}
                    {safeArray(analysis?.formatSuggestions).length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-4">Format Suggestions</h3>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <ul className="space-y-2">
                            {safeArray(analysis?.formatSuggestions).map((suggestion, i) => (
                              <li key={i} className="flex items-start text-purple-700">
                                <FaArrowRight className="mr-2 mt-1 flex-shrink-0" />
                                {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="space-y-6">
                    {/* Skills to Add */}
                    {safeArray(analysis?.skillsToAdd).length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-4">Skills to Add</h3>
                        <div className="space-y-3">
                          {safeArray(analysis?.skillsToAdd).map((skill, i) => (
                            <div key={i} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="font-medium text-blue-800">{skill?.skill || 'Unknown skill'}</p>
                              <p className="text-sm text-blue-600 mt-1">{skill?.reason || ''}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills to Improve */}
                    {safeArray(analysis?.skillsToImprove).length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-4">Skills to Improve</h3>
                        <div className="space-y-3">
                          {safeArray(analysis?.skillsToImprove).map((skill, i) => (
                            <div key={i} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="font-medium text-yellow-800">{skill?.skill || 'Unknown skill'}</p>
                              <p className="text-sm text-yellow-600 mt-1">
                                {skill?.currentLevel || 'Unknown'} → {skill?.recommendedLevel || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">{skill?.reason || ''}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Experience Tab */}
                {activeTab === 'experience' && (
                  <div className="space-y-6">
                    {safeArray(analysis?.experienceGaps).length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-4">Experience Gaps</h3>
                        <div className="space-y-2">
                          {safeArray(analysis?.experienceGaps).map((gap, i) => (
                            <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-700">
                              {gap}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {safeArray(analysis?.experienceHighlights).length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-4">Experience Highlights</h3>
                        <div className="space-y-2">
                          {safeArray(analysis?.experienceHighlights).map((highlight, i) => (
                            <div key={i} className="p-3 bg-green-50 rounded-lg border border-green-200 text-green-700">
                              {highlight}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Keywords Tab */}
                {activeTab === 'keywords' && (
                  <div className="space-y-6">
                    {safeArray(analysis?.recommendedKeywords).length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-4">Recommended Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {safeArray(analysis?.recommendedKeywords).map((keyword, i) => (
                            <span key={i} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {safeArray(analysis?.missingKeywords).length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold mb-4">Missing Keywords</h3>
                        <div className="flex flex-wrap gap-2">
                          {safeArray(analysis?.missingKeywords).map((keyword, i) => (
                            <span key={i} className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions Tab */}
                {activeTab === 'actions' && (
                  <div className="space-y-6">
                    {safeArray(analysis?.improvementActions).length > 0 ? (
                      <div className="space-y-4">
                        {safeArray(analysis?.improvementActions).map((action, i) => (
                          <div key={i} className={`p-5 rounded-lg border-2 ${getPriorityColor(action?.priority)}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center mb-2">
                                  <span className={`w-2 h-2 rounded-full ${getPriorityBadge(action?.priority)} mr-2`}></span>
                                  <span className="font-bold">{action?.action || 'Unknown action'}</span>
                                </div>
                                <p className="text-sm mt-1">{action?.description || ''}</p>
                                {action?.section && (
                                  <span className="inline-block mt-2 text-xs bg-white bg-opacity-50 px-2 py-1 rounded">
                                    Section: {action.section}
                                  </span>
                                )}
                              </div>
                              <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${
                                action?.priority === 'HIGH' ? 'bg-red-200 text-red-800' :
                                action?.priority === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                                'bg-green-200 text-green-800'
                              }`}>
                                {action?.priority || 'LOW'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No specific improvement actions available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={downloadAnalysis}
                className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              >
                <FaDownload />
                <span>Download Analysis</span>
              </button>
              <button
                onClick={() => navigate('/generate-resume')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
              >
                <FaFileAlt />
                <span>Update Resume</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalysis;