import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import DynamicResumeTemplate from './DynamicResumeTemplate';

const ResumePreview = () => {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem('previewResume');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setResumeData(parsed);
      } catch (error) {
        console.error('Error parsing resume data:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Resume Data Found</h2>
          <button
            onClick={handleGoBack}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Back Button */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={handleGoBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft />
            <span>Back to Generator</span>
          </button>
        </div>
      </div>

      {/* Resume Template with Download Buttons */}
      <div className="container mx-auto px-4 py-8">
        <DynamicResumeTemplate jsonData={resumeData} />
      </div>
    </div>
  );
};

export default ResumePreview;