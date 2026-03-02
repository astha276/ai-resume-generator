import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHistory, 
  FaStar, 
  FaRegStar, 
  FaTrash, 
  FaSearch,
  FaFileAlt,
  FaCalendarAlt,
  FaTags,
  FaEye,
  FaDownload,
  FaFilter,
  FaSortAmountDown,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaEdit  // Added missing import
} from 'react-icons/fa';
import ResumeService from '../api/ResumeService';
import DynamicResumeTemplate from './DynamicResumeTemplate';

const ResumeHistory = () => {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedResume, setSelectedResume] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState({ total: 0, favorites: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  useEffect(() => {
    if (resumes && Array.isArray(resumes)) {
      filterResumes();
    }
  }, [searchTerm, filter, resumes]);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ResumeService.getResumeHistory();
      console.log('Fetched resumes data:', data);
      
      // Check if data is array, if not, try to extract array from response
      let resumesArray = [];
      if (Array.isArray(data)) {
        resumesArray = data;
      } else if (data && typeof data === 'object') {
        // If it's an object with a data property that's an array
        if (data.data && Array.isArray(data.data)) {
          resumesArray = data.data;
        } 
        // If it's an object with a resumes property that's an array
        else if (data.resumes && Array.isArray(data.resumes)) {
          resumesArray = data.resumes;
        }
        // If it's an object with values that are arrays
        else {
          // Try to find any array property
          for (let key in data) {
            if (Array.isArray(data[key])) {
              resumesArray = data[key];
              break;
            }
          }
        }
      }
      
      console.log('Processed resumes array:', resumesArray);
      setResumes(resumesArray);
      setFilteredResumes(resumesArray);
      
      // Calculate stats
      setStats({
        total: resumesArray.length,
        favorites: resumesArray.filter(r => r && r.favorite).length
      });
      
    } catch (error) {
      console.error('Error fetching resumes:', error);
      setError('Failed to load resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterResumes = () => {
    if (!resumes || !Array.isArray(resumes)) return;
    
    let filtered = [...resumes];
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r?.tags?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r?.userDescription?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply filter
    if (filter === 'favorites') {
      filtered = filtered.filter(r => r?.favorite);
    } else if (filter === 'recent') {
      filtered = filtered.sort((a, b) => 
        new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      );
    }
    
    setFilteredResumes(filtered);
    setCurrentPage(1);
  };

  const toggleFavorite = async (id) => {
    try {
      await ResumeService.toggleFavorite(id);
      // Update local state
      const updatedResumes = resumes.map(r => 
        r.id === id ? { ...r, favorite: !r.favorite } : r
      );
      setResumes(updatedResumes);
      
      // Update stats
      setStats({
        total: updatedResumes.length,
        favorites: updatedResumes.filter(r => r.favorite).length
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteResume = async (id) => {
    if (window.confirm('Are you sure you want to delete this resume?')) {
      try {
        await ResumeService.deleteResume(id);
        const updatedResumes = resumes.filter(r => r.id !== id);
        setResumes(updatedResumes);
        
        // Update stats
        setStats({
          total: updatedResumes.length,
          favorites: updatedResumes.filter(r => r.favorite).length
        });
        
        if (selectedResume?.id === id) {
          setSelectedResume(null);
          setShowPreview(false);
        }
      } catch (error) {
        console.error('Error deleting resume:', error);
      }
    }
  };

  const viewResume = (resume) => {
    setSelectedResume(resume);
    setShowPreview(true);
    setTimeout(() => {
      document.getElementById('preview-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const downloadResume = (resume) => {
    const content = resume.generatedContent || {};
    const dataStr = JSON.stringify(content, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${resume.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'resume'}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResumes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResumes.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <FaFileAlt className="text-6xl text-red-400 mx-auto mb-4" />
          <h3 className="text-xl text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchResumes}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <FaHistory className="mr-3 text-blue-600" />
              Resume History
            </h1>
            <button
              onClick={() => navigate('/generate-resume')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
            >
              <FaFileAlt className="mr-2" />
              Generate New
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <FaFileAlt className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Resumes</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3 mr-4">
                <FaStar className="text-yellow-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Favorites</p>
                <p className="text-3xl font-bold text-gray-800">{stats.favorites}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <FaCalendarAlt className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">This Month</p>
                <p className="text-3xl font-bold text-gray-800">
                  {resumes.filter(r => {
                    if (!r?.createdAt) return false;
                    const date = new Date(r.createdAt);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && 
                           date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <FaTags className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">With Tags</p>
                <p className="text-3xl font-bold text-gray-800">
                  {resumes.filter(r => r?.tags).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, tags, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaFilter className="mr-2" />
                All
              </button>
              <button
                onClick={() => setFilter('favorites')}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  filter === 'favorites' 
                    ? 'bg-yellow-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaStar className="mr-2" />
                Favorites
              </button>
              <button
                onClick={() => setFilter('recent')}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  filter === 'recent' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaSortAmountDown className="mr-2" />
                Recent
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Resume List */}
          <div className="space-y-4">
            {filteredResumes.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl text-gray-500 mb-2">No resumes found</h3>
                <p className="text-gray-400 mb-4">
                  {searchTerm ? 'Try a different search term' : 'Generate your first resume to get started'}
                </p>
                <button
                  onClick={() => navigate('/generate-resume')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Generate Resume
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentItems.map((resume) => (
                    resume && (
                      <div 
                        key={resume.id} 
                        className={`bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer ${
                          selectedResume?.id === resume.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => viewResume(resume)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-semibold text-gray-800 mr-3">
                                {resume.title || 'Untitled Resume'}
                              </h3>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(resume.id);
                                }}
                                className="focus:outline-none"
                              >
                                {resume.favorite ? (
                                  <FaStar className="text-yellow-500 text-xl" />
                                ) : (
                                  <FaRegStar className="text-gray-400 text-xl hover:text-yellow-500" />
                                )}
                              </button>
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {resume.userDescription || 'No description'}
                            </p>
                            
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              <span className="flex items-center">
                                <FaCalendarAlt className="mr-1" />
                                {formatDate(resume.createdAt)}
                              </span>
                              {resume.tags && (
                                <span className="flex items-center">
                                  <FaTags className="mr-1" />
                                  {resume.tags}
                                </span>
                              )}
                            </div>

                            {/* Skills Preview */}
                            {resume.generatedContent?.skills && Array.isArray(resume.generatedContent.skills) && (
                              <div className="mt-3 flex flex-wrap gap-1">
                                {resume.generatedContent.skills.slice(0, 3).map((skill, i) => (
                                  <span key={i} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                    {skill.title || skill}
                                  </span>
                                ))}
                                {resume.generatedContent.skills.length > 3 && (
                                  <span className="text-xs text-gray-400">
                                    +{resume.generatedContent.skills.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                viewResume(resume);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Preview"
                            >
                              <FaEye size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/resume/${resume.id}`);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Edit Resume"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadResume(resume);
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                              title="Download JSON"
                            >
                              <FaDownload size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteResume(resume.id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow-sm">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, filteredResumes.length)}
                      </span>{' '}
                      of <span className="font-medium">{filteredResumes.length}</span> results
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <FaChevronLeft size={14} />
                      </button>
                      <span className="px-4 py-1 bg-gray-100 rounded-md">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <FaChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column - Preview Section */}
          <div id="preview-section" className="lg:sticky lg:top-4 lg:self-start">
            {showPreview && selectedResume ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Resume Preview</h2>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="text-white hover:text-gray-200"
                    >
                      <FaTimes size={20} />
                    </button>
                  </div>
                  <p className="text-sm opacity-90 mt-1">{selectedResume.title || 'Untitled'}</p>
                </div>
                
                <div className="p-4 max-h-[800px] overflow-y-auto">
                  <DynamicResumeTemplate jsonData={selectedResume.generatedContent || {}} />
                </div>
                
                <div className="border-t px-6 py-4 bg-gray-50 flex justify-end gap-3">
                  <button
                    onClick={() => downloadResume(selectedResume)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
                  >
                    <FaDownload className="mr-2" />
                    Download JSON
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
                  >
                    Print
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <FaEye className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl text-gray-500 mb-2">No Resume Selected</h3>
                <p className="text-gray-400">
                  Click on any resume from the list to preview it here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeHistory;