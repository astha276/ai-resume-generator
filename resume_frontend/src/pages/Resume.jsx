import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaPrint, 
  FaDownload, 
  FaShare,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEdit,
  FaPalette,
  FaHome,
  FaSpinner
} from 'react-icons/fa';

// Assume this component handles rendering the JSON data into an HTML structure
import DynamicResumeTemplate from './DynamicResumeTemplate.jsx';

const Resume = () => {
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('corporate');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadResumeData = () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let data = null;
        
        // 1. Check location state (Highest priority - used for immediate navigation)
        if (location.state && location.state.resumeData) {
          console.log('Loading resume data from location state');
          data = location.state.resumeData;
        }
        
        // 2. Check TEMPORARY sessionStorage (Used for New Tab functionality)
        if (!data) {
          // NOTE: Using 'tempResumeData' as discussed in the previous fix
          const tempStoredData = sessionStorage.getItem('tempResumeData');
          if (tempStoredData) {
            console.log('Loading resume data from temp sessionStorage (New Tab Fallback)');
            data = JSON.parse(tempStoredData);
            sessionStorage.removeItem('tempResumeData'); // CRITICAL: Clear temp data immediately
          }
        }

        // 3. Check PERSISTENT sessionStorage (Used for editing or general state recovery)
        if (!data) {
          const storedData = sessionStorage.getItem('resumeData');
          if (storedData) {
            console.log('Loading resume data from persistent sessionStorage');
            data = JSON.parse(storedData);
          }
        }
        
        // 4. Check URL query params (If data was passed as base64 in a shared link)
        if (!data && location.search) {
          const params = new URLSearchParams(location.search);
          const dataParam = params.get('data');
          if (dataParam) {
            try {
              const decodedData = JSON.parse(atob(dataParam));
              data = decodedData;
              console.log('Loading resume data from URL params');
            } catch (e) {
              console.warn('Failed to parse data from URL:', e);
            }
          }
        }
        
        if (data) {
          setResumeData(data);
          console.log('Resume data loaded successfully:', data);
        } else {
          setError('No resume data found. Please generate a resume first.');
        }
      } catch (err) {
        console.error('Error loading resume data:', err);
        setError('Failed to load resume data. Please try generating again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadResumeData();
    
    // Optional: Clear persistent sessionStorage after a long duration
    const clearStorageTimeout = setTimeout(() => {
      sessionStorage.removeItem('resumeData');
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearTimeout(clearStorageTimeout);
  }, [location]); // Re-run effect if location changes (e.g., URL params or state)

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGenerateNew = () => {
    navigate('/generate');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    // Implementation placeholder for PDF generation
    alert('PDF download would be implemented here with a library like html2pdf or jsPDF');
  };

  const handleShare = () => {
    if (!resumeData) return;
    
    // 1. Try Native Share API first
    if (navigator.share) {
      navigator.share({
        title: `${resumeData.personalInformation?.fullName || 'My'} Resume`,
        text: `Check out my AI-generated resume!`,
        url: window.location.href,
      });
    } 
    // 2. Fallback: Copy URL with Base64 encoded data
    else if (navigator.clipboard) {
      try {
        const encodedData = btoa(JSON.stringify(resumeData));
        const shareUrl = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;
        
        navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard! (Data is embedded in the URL)');
      } catch (e) {
        console.error("Error creating or copying share URL:", e);
        alert('Could not create share link due to data size or clipboard restriction.');
      }
    } else {
      alert('Sharing is not supported in your browser');
    }
  };

  const handleEdit = () => {
    // Store data in persistent storage for the edit page to load
    if (resumeData) {
      sessionStorage.setItem('resumeData', JSON.stringify(resumeData));
      sessionStorage.setItem('editMode', 'true');
      // Navigate to the generate page, which acts as the editor
      navigate('/generate', { 
        state: { 
          resumeData,
          editMode: true 
        } 
      });
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    // Apply theme to the document root (common for Tailwind/DaisyUI)
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const themes = [
    { id: 'corporate', name: 'Corporate', color: 'btn-primary' },
    { id: 'business', name: 'Business', color: 'btn-secondary' },
    { id: 'luxury', name: 'Luxury', color: 'btn-accent' },
    { id: 'night', name: 'Dark', color: 'btn-neutral' }
  ];

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
        <div className="text-center max-w-md">
          <FaSpinner className="text-6xl text-primary animate-spin mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-base-content mb-3">Loading Your Resume</h2>
          <p className="text-base-content/80 mb-8">Please wait while we prepare your AI-generated resume...</p>
          <div className="loading loading-dots loading-lg text-primary"></div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error || !resumeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-2xl">
          <div className="card-body text-center">
            <FaExclamationTriangle className="text-6xl text-error mx-auto mb-4" />
            <h2 className="card-title justify-center text-2xl font-bold text-error">Error Loading Resume</h2>
            <p className="text-base-content/80 mb-6">{error || "Resume data is missing or corrupted."}</p>
            
            <div className="card-actions justify-center gap-3 mt-4">
              <button 
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/generate')}
              >
                Generate New Resume
              </button>
              <button 
                className="btn btn-outline btn-lg"
                onClick={handleGoBack}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div data-theme={theme} className="min-h-screen bg-base-100">
      {/* Header with controls (Sticky) */}
      <div className="sticky top-0 z-50 bg-base-100/90 backdrop-blur-md shadow-lg border-b border-base-300 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleGoBack}
                className="btn btn-ghost btn-circle sm:btn-sm lg:btn-md"
                title="Go Back"
              >
                <FaArrowLeft className="text-lg" />
              </button>
              
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-base-content">
                  {resumeData.personalInformation?.fullName || 'AI-Generated Resume'}
                </h1>
                <p className="text-sm text-base-content/70">
                  {resumeData.personalInformation?.title || 'Professional Resume'}
                </p>
              </div>
            </div>
            
            {/* Theme Selector */}
            <div className="dropdown dropdown-bottom dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle" title="Change Theme">
                <FaPalette className="text-xl" />
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-50">
                <li className="menu-title">
                  <span>Select Theme</span>
                </li>
                {themes.map((t) => (
                  <li key={t.id}>
                    <button 
                      className={theme === t.id ? 'active' : ''}
                      onClick={() => handleThemeChange(t.id)}
                    >
                      {t.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-2">
              <button 
                onClick={handleEdit}
                className="btn btn-outline btn-sm sm:btn-md"
                title="Edit Resume"
              >
                <FaEdit className="mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              
              <button 
                onClick={handleShare}
                className="btn btn-outline btn-success btn-sm sm:btn-md"
                title="Share Resume"
              >
                <FaShare className="mr-2" />
                <span className="hidden sm:inline">Share</span>
              </button>
              
              <button 
                onClick={handleDownloadPDF}
                className="btn btn-outline btn-secondary btn-sm sm:btn-md"
                title="Download PDF"
              >
                <FaDownload className="mr-2" />
                <span className="hidden sm:inline">PDF</span>
              </button>
              
              <button 
                onClick={handlePrint}
                className="btn btn-primary btn-sm sm:btn-md"
                title="Print Resume"
              >
                <FaPrint className="mr-2" />
                <span className="hidden sm:inline">Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 print:hidden">
        <div className="alert alert-success shadow-lg">
          <FaCheckCircle className="text-2xl" />
          <div className="flex-1">
            <h3 className="font-bold">Resume Generated Successfully!</h3>
            <div className="text-xs">
              This resume was generated using AI. You can edit, print, or download it.
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className="btn btn-sm btn-outline"
              onClick={handleGenerateNew}
            >
              Generate Another
            </button>
            <button 
              className="btn btn-sm btn-ghost"
              onClick={handleGoHome}
            >
              <FaHome />
            </button>
          </div>
        </div>
        
        {/* Raw JSON Debug Card */}
        <div className="collapse collapse-arrow bg-base-300 mt-4">
          <input type="checkbox" />
          <div className="collapse-title text-xl font-medium">
            View Raw Parsed Data (Debug)
          </div>
          <div className="collapse-content">
            <pre className="whitespace-pre-wrap text-base-content p-4 bg-base-200 rounded-lg max-h-96 overflow-y-auto text-sm">
              {JSON.stringify(resumeData, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Resume Content (Target for Printing) */}
      <div className="max-w-7xl mx-auto px-4 py-6" id="resume-content">
        <DynamicResumeTemplate 
          jsonData={resumeData}
          isLoading={false}
        />
      </div>

      {/* Footer Actions */}
      <div className="max-w-7xl mx-auto px-4 py-8 print:hidden">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl">What would you like to do next?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="card bg-base-100 shadow-md">
                <div className="card-body items-center text-center">
                  <h3 className="card-title">🖨️ Print</h3>
                  <p className="text-sm">Get a physical copy of your resume</p>
                  <div className="card-actions mt-4">
                    <button 
                      onClick={handlePrint}
                      className="btn btn-primary w-full"
                    >
                      Print Now
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-md">
                <div className="card-body items-center text-center">
                  <h3 className="card-title">📝 Edit</h3>
                  <p className="text-sm">Make changes to your resume</p>
                  <div className="card-actions mt-4">
                    <button 
                      onClick={handleEdit}
                      className="btn btn-secondary w-full"
                    >
                      Edit Resume
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100 shadow-md">
                <div className="card-body items-center text-center">
                  <h3 className="card-title">🔄 New</h3>
                  <p className="text-sm">Generate another resume</p>
                  <div className="card-actions mt-4">
                    <button 
                      onClick={handleGenerateNew}
                      className="btn btn-accent w-full"
                    >
                      Generate Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Notice */}
      <div className="print:hidden max-w-7xl mx-auto px-4 pb-8">
        <div className="alert alert-info">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 className="font-bold">Printing Tips</h3>
            <div className="text-xs">
              <p>• Use "Print" button for best results (it hides the controls)</p>
              <p>• Select "Save as PDF" in your print dialog to save digitally</p>
            </div>
          </div>
        </div>
      </div>

      {/* Global Print Styles */}
      <style jsx global>{`
        @media print {
          /* Ensure only the resume container is visible */
          body > * {
            visibility: hidden;
            height: 0;
            overflow: hidden;
          }
          
          #resume-content, #resume-content * {
            visibility: visible;
            height: auto;
            overflow: visible;
          }
          
          #resume-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Ensure proper page breaks for long resumes */
          .page-break {
            page-break-before: always;
          }
          
          /* Improve print contrast and turn off backgrounds */
          * {
            background: transparent !important;
            color: #000 !important;
            box-shadow: none !important;
          }
          .bg-gradient-to-r, .text-primary, .text-secondary {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Resume;