import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes,
  FaRedo,
  FaPlus,
  FaMinus,
  FaDownload,
  FaPrint,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';
import ResumeService from '../api/ResumeService';
import DynamicResumeTemplate from './DynamicResumeTemplate';

const ResumeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedResume, setEditedResume] = useState(null);
  const [activeSection, setActiveSection] = useState('summary');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [changedSections, setChangedSections] = useState(new Set());

  useEffect(() => {
    fetchResume();
  }, [id]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const data = await ResumeService.getResumeById(id);
      console.log('Fetched resume:', data);
      setResume(data);
      setEditedResume(JSON.parse(JSON.stringify(data))); // Deep copy
    } catch (err) {
      console.error('Error fetching resume:', err);
      setError('Failed to load resume');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/resume-history');
  };

  const handleDelete = async () => {
    try {
      await ResumeService.deleteResume(id);
      navigate('/resume-history');
    } catch (err) {
      console.error('Error deleting resume:', err);
      setError('Failed to delete resume');
    }
  };

  const handleRegenerateSection = async (section) => {
    try {
      setRegeneratingSection(section);
      
      // Get context based on section
      let context = '';
      let prompt = '';
      
      const userDescription = resume.userDescription || editedResume.userDescription || '';
      
      switch(section) {
        case 'summary':
          prompt = `Generate a professional summary based on: ${userDescription}`;
          break;
        case 'skills':
          prompt = `Generate technical skills based on: ${userDescription}`;
          break;
        case 'experience':
          prompt = `Generate work experience based on: ${userDescription}`;
          // Get current job title if exists for context
          const currentJobTitle = editedResume?.generatedContent?.experience?.[0]?.jobTitle || '';
          if (currentJobTitle) {
            context = `Current job title: ${currentJobTitle}`;
          }
          break;
        case 'projects':
          prompt = `Generate relevant projects based on: ${userDescription}`;
          break;
        case 'achievements':
          prompt = `Generate professional achievements based on the experience: ${userDescription}`;
          break;
        default:
          prompt = userDescription;
      }
      
      // Call backend to regenerate section
      const result = await ResumeService.regenerateSection(id, section, prompt, context);
      
      // Update the edited resume with new section
      const updated = { ...editedResume };
      if (!updated.generatedContent) updated.generatedContent = {};
      
      // Parse the regenerated content
      let newContent;
      try {
        newContent = typeof result.content === 'string' ? JSON.parse(result.content) : result.content;
      } catch (e) {
        newContent = result.content;
      }
      
      updated.generatedContent[section] = newContent;
      setEditedResume(updated);
      
      // Mark section as changed
      setChangedSections(prev => new Set(prev).add(section));
      
      // Auto-save the change
      await ResumeService.updateResumeSection(id, section, newContent);
      
      setRegeneratingSection(null);
      
    } catch (err) {
      console.error(`Error regenerating ${section}:`, err);
      setRegeneratingSection(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      
      // Save basic info
      await ResumeService.updateResume(id, {
        title: editedResume.title,
        tags: editedResume.tags,
        isFavorite: editedResume.favorite
      });
      
      // Save each changed section individually
      if (changedSections.size > 0) {
        const savePromises = [];
        
        changedSections.forEach(section => {
          if (editedResume.generatedContent?.[section]) {
            savePromises.push(
              ResumeService.updateResumeSection(id, section, editedResume.generatedContent[section])
            );
          }
        });
        
        await Promise.all(savePromises);
        setChangedSections(new Set());
      }
      
      // If there's a bulk update endpoint, you could use that instead
      // await ResumeService.updateResumeContent(id, editedResume.generatedContent);
      
      setResume(editedResume);
      setIsEditing(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (err) {
      console.error('Error saving resume:', err);
      setSaveStatus('error');
    }
  };

  const handleCancel = () => {
    setEditedResume(JSON.parse(JSON.stringify(resume)));
    setIsEditing(false);
    setActiveSection('summary');
    setChangedSections(new Set());
  };

  const handleFieldChange = (section, field, value, isArray = false) => {
    const updated = { ...editedResume };
    
    if (!updated.generatedContent) {
      updated.generatedContent = {};
    }
    
    if (isArray) {
      // Handle array updates (skills, projects, etc.)
      updated.generatedContent[section] = value;
    } else if (field.includes('.')) {
      // Nested field like personalInfo.fullName
      const parts = field.split('.');
      let current = updated.generatedContent[section];
      if (!current) current = updated.generatedContent[section] = {};
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    } else {
      if (!updated.generatedContent[section]) {
        updated.generatedContent[section] = {};
      }
      updated.generatedContent[section][field] = value;
    }
    
    setEditedResume(updated);
    
    // Mark section as changed
    setChangedSections(prev => new Set(prev).add(section));
  };

  const handleArrayItemChange = (section, index, field, value) => {
    const updated = { ...editedResume };
    if (!updated.generatedContent?.[section]) return;
    
    const array = [...updated.generatedContent[section]];
    if (!array[index]) array[index] = {};
    
    if (field) {
      array[index] = { ...array[index], [field]: value };
    } else {
      array[index] = value;
    }
    
    updated.generatedContent[section] = array;
    setEditedResume(updated);
    setChangedSections(prev => new Set(prev).add(section));
  };

  const addArrayItem = (section, defaultValue = {}) => {
    const updated = { ...editedResume };
    if (!updated.generatedContent) updated.generatedContent = {};
    if (!updated.generatedContent[section]) updated.generatedContent[section] = [];
    
    updated.generatedContent[section] = [
      ...updated.generatedContent[section],
      defaultValue
    ];
    
    setEditedResume(updated);
    setChangedSections(prev => new Set(prev).add(section));
  };

  const removeArrayItem = (section, index) => {
    const updated = { ...editedResume };
    if (!updated.generatedContent?.[section]) return;
    
    updated.generatedContent[section] = updated.generatedContent[section].filter((_, i) => i !== index);
    
    setEditedResume(updated);
    setChangedSections(prev => new Set(prev).add(section));
  };

  const renderEditSection = () => {
    if (!editedResume?.generatedContent) return null;
    
    const content = editedResume.generatedContent;
    
    switch(activeSection) {
      case 'summary':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Professional Summary</h3>
              <button
                onClick={() => handleRegenerateSection('summary')}
                disabled={regeneratingSection === 'summary'}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {regeneratingSection === 'summary' ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaRedo />
                )}
                <span>Regenerate with AI</span>
              </button>
            </div>
            
            <textarea
              value={content.summary?.motivation || content.summary || ''}
              onChange={(e) => handleFieldChange('summary', 'motivation', e.target.value)}
              rows={6}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Professional summary..."
            />
          </div>
        );
        
      case 'personal':
        const personal = content.personalInformation || {};
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  value={personal.fullName || ''}
                  onChange={(e) => handleFieldChange('personalInformation', 'fullName', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={personal.email || ''}
                  onChange={(e) => handleFieldChange('personalInformation', 'email', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input
                  type="text"
                  value={personal.phoneNumber || ''}
                  onChange={(e) => handleFieldChange('personalInformation', 'phoneNumber', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={personal.location || ''}
                  onChange={(e) => handleFieldChange('personalInformation', 'location', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn</label>
                <input
                  type="text"
                  value={personal.linkedIn || ''}
                  onChange={(e) => handleFieldChange('personalInformation', 'linkedIn', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">GitHub</label>
                <input
                  type="text"
                  value={personal.github || ''}
                  onChange={(e) => handleFieldChange('personalInformation', 'github', e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );
        
      case 'skills':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Skills</h3>
              <button
                onClick={() => handleRegenerateSection('skills')}
                disabled={regeneratingSection === 'skills'}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {regeneratingSection === 'skills' ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaRedo />
                )}
                <span>Regenerate with AI</span>
              </button>
            </div>
            
            {content.skills?.map((skill, index) => (
              <div key={index} className="flex gap-2 items-center border p-3 rounded-lg">
                <input
                  type="text"
                  value={skill.title || skill.name || skill || ''}
                  onChange={(e) => handleArrayItemChange('skills', index, 'title', e.target.value)}
                  placeholder="Skill name"
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={skill.level || ''}
                  onChange={(e) => handleArrayItemChange('skills', index, 'level', e.target.value)}
                  className="w-40 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button
                  onClick={() => removeArrayItem('skills', index)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Remove skill"
                >
                  <FaMinus />
                </button>
              </div>
            ))}
            
            <button
              onClick={() => addArrayItem('skills', { title: '', level: '' })}
              className="flex items-center space-x-2 text-green-600 hover:text-green-800"
            >
              <FaPlus />
              <span>Add Skill</span>
            </button>
          </div>
        );
        
      case 'experience':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Work Experience</h3>
              <button
                onClick={() => handleRegenerateSection('experience')}
                disabled={regeneratingSection === 'experience'}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {regeneratingSection === 'experience' ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaRedo />
                )}
                <span>Regenerate with AI</span>
              </button>
            </div>
            
            {content.experience?.map((exp, index) => (
              <div key={index} className="border p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <h4 className="font-semibold">Position {index + 1}</h4>
                  <button
                    onClick={() => removeArrayItem('experience', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaMinus />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={exp.jobTitle || ''}
                    onChange={(e) => handleArrayItemChange('experience', index, 'jobTitle', e.target.value)}
                    placeholder="Job Title"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={exp.company || ''}
                    onChange={(e) => handleArrayItemChange('experience', index, 'company', e.target.value)}
                    placeholder="Company"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={exp.startDate || ''}
                    onChange={(e) => handleArrayItemChange('experience', index, 'startDate', e.target.value)}
                    placeholder="Start Date"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={exp.endDate || ''}
                    onChange={(e) => handleArrayItemChange('experience', index, 'endDate', e.target.value)}
                    placeholder="End Date"
                    className="p-2 border rounded"
                  />
                </div>
                
                <textarea
                  value={exp.description || ''}
                  onChange={(e) => handleArrayItemChange('experience', index, 'description', e.target.value)}
                  placeholder="Description"
                  rows={3}
                  className="w-full p-2 border rounded"
                />
              </div>
            ))}
            
            <button
              onClick={() => addArrayItem('experience', { jobTitle: '', company: '', startDate: '', endDate: '', description: '' })}
              className="flex items-center space-x-2 text-green-600 hover:text-green-800"
            >
              <FaPlus />
              <span>Add Experience</span>
            </button>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>Edit section coming soon: {activeSection}</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-5xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Resume</h2>
          <p className="text-gray-600 mb-4">{error || 'Resume not found'}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGoBack}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaArrowLeft />
              </button>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {isEditing ? 'Editing: ' : ''}{resume.title}
                  </h1>
                  {changedSections.size > 0 && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      {changedSections.size} unsaved change{changedSections.size !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Created: {new Date(resume.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {saveStatus === 'saving' ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaSave />
                    )}
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    <FaTimes />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <FaEdit />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <FaTrash />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
          
          {saveStatus === 'success' && (
            <div className="mt-2 p-2 bg-green-100 text-green-700 rounded flex items-center">
              <FaCheckCircle className="mr-2" />
              Changes saved successfully!
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="mt-2 p-2 bg-red-100 text-red-700 rounded flex items-center">
              <FaExclamationTriangle className="mr-2" />
              Failed to save changes. Please try again.
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Section Navigation (visible in edit mode) */}
          {isEditing && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
                <h3 className="font-bold text-lg mb-4">Sections</h3>
                <nav className="space-y-2">
                  {['summary', 'personal', 'skills', 'experience', 'projects', 'achievements', 'interests'].map(section => (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={`w-full text-left px-3 py-2 rounded-lg capitalize flex items-center justify-between ${
                        activeSection === section
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span>{section}</span>
                      {changedSections.has(section) && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          activeSection === section ? 'bg-blue-700' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          Edited
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className={isEditing ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {isEditing ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                {renderEditSection()}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <DynamicResumeTemplate jsonData={resume.generatedContent} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4">Delete Resume</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{resume.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeDetails;