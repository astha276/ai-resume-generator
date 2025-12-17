import React, { useState } from 'react';
import { 
  FaRobot, 
  FaMagic, 
  FaEraser, 
  FaSpinner, 
  FaFileAlt, 
  FaExternalLinkAlt,
  FaEye 
} from 'react-icons/fa';
import { generateResume } from '../api/ResumeService';
import { useNavigate } from 'react-router-dom';

const GenerateResume = () => {
  const [description, setDescription] = useState('');
  const [generatedResume, setGeneratedResume] = useState(null); // Raw string/JSON
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsedResumeData, setParsedResumeData] = useState(null); // Parsed object for usage
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!description.trim()) {
      alert('Please enter a description before generating the resume.');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setGeneratedResume(null);
    setParsedResumeData(null);
    
    try {
      console.log('Sending description to server:', description);
      
      // Assume generateResume returns a JSON string
      const resultString = await generateResume(description);
      
      // Store the raw string
      setGeneratedResume(resultString);
      
      let parsedData;
      // Try to parse the JSON
      try {
        // 1. Parse the string into a JavaScript object
        const rawParsedObject = JSON.parse(resultString);
        
        // 2. CRITICAL FIX: Unwrap the 'data' property if the AI output is wrapped
        // Check if the parsed object has the core resume structure (like personalInformation) 
        // or if it's wrapped in a 'data' property.
        if (rawParsedObject && rawParsedObject.personalInformation) {
            // It's the resume object directly
            parsedData = rawParsedObject;
        } else if (rawParsedObject && rawParsedObject.data) {
            // It's a wrapped response. Extract the actual resume object.
            parsedData = rawParsedObject.data;
        } else {
            // Default case (might need adjustment based on your API)
            parsedData = rawParsedObject;
        }

        setParsedResumeData(parsedData);
        console.log('Successfully parsed and extracted resume data:', parsedData);
        // The console log now confirms you are sending the actual resume object
      } catch (parseError) {
        console.warn('Generated resume is not valid JSON, storing raw content only:', parseError);
        // If it's not JSON, store as a structure indicating raw content
        parsedData = { rawContent: resultString };
        setParsedResumeData(parsedData);
      }
      
    } catch (err) {
      console.error('API Error:', err);
      // Log the full error object if available
      const detailMessage = err.response?.data?.message || err.message;
      setError(`Failed to generate resume. Details: ${detailMessage}. Check the console for more details.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setDescription('');
    setGeneratedResume(null);
    setParsedResumeData(null);
    setError(null);
    console.log('Input cleared.');
  };

  // 1. Navigate to resume preview page using React Router State
  const handlePreviewResume = () => {
    if (parsedResumeData) {
      // Pass the parsed data directly in the navigation state
      navigate('/resume-preview', { 
        state: { resumeData: parsedResumeData } 
      });
    }
  };

  // 2. Open resume in new tab (requires sessionStorage for the new window)
  const handleOpenInNewTab = () => {
    if (parsedResumeData) {
      // Store the data in sessionStorage so the new window can access it
      sessionStorage.setItem('tempResumeData', JSON.stringify(parsedResumeData));
      
      // Open in new tab
      window.open('/resume-preview', '_blank', 'noopener,noreferrer');
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-200 p-4">
      <div className="card w-full max-w-4xl bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          
          <h1 className="card-title text-4xl font-extrabold text-primary mb-6 flex items-center">
            <FaRobot className="mr-3 text-secondary" />
            AI Resume Description Generator
          </h1>
          
          {/* Input Section */}
          <p className="text-lg text-base-content mb-8">
            Provide a **detailed description** of your professional experience below.
          </p>

          <div className="form-control w-full mb-8">
            <label className="label">
              <span className="label-text text-xl font-semibold text-base-content flex items-center">
                <FaMagic className="mr-2 text-warning" />
                Your Professional Description
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered h-64 w-full text-base border-2 border-accent focus:border-primary transition duration-300"
              placeholder="E.g., I worked as a Senior Software Engineer for 5 years. My skills include React, Node.js, AWS. I have a Bachelor's degree in Computer Science from XYZ University. I've worked on projects like an e-commerce platform and a mobile app..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>

          <div className="card-actions justify-center space-x-4 mb-6">
            {/* Generate Button */}
            <button 
              className="btn btn-primary btn-lg shadow-lg transition duration-300 hover:scale-105"
              onClick={handleGenerate}
              disabled={isLoading || !description.trim()}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="text-xl animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FaMagic className="text-xl" />
                  Generate Resume
                </>
              )}
            </button>
            
            {/* Clear Button */}
            <button 
              className="btn btn-outline btn-error btn-lg shadow-lg transition duration-300"
              onClick={handleClear}
              disabled={isLoading}
            >
              <FaEraser className="text-xl" />
              Clear Input
            </button>
          </div>
          
          {/* Result and Error Display Section */}
          {(generatedResume || error) && (
            <div className={`w-full mt-6 p-6 rounded-lg text-left ${error ? 'bg-error text-error-content' : 'bg-success/20 border-2 border-success'}`}>
              {error ? (
                <p className="font-bold">{error}</p>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-success flex items-center">
                      <FaFileAlt className="mr-2" /> Resume Generated Successfully!
                    </h3>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={handlePreviewResume}
                        disabled={!parsedResumeData}
                      >
                        <FaEye className="mr-2" />
                        Preview Resume
                      </button>
                      
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleOpenInNewTab}
                        disabled={!parsedResumeData}
                      >
                        <FaExternalLinkAlt className="mr-2" />
                        Open in New Tab
                      </button>
                    </div>
                  </div>
                  
                  {/* JSON Preview (Collapsible) */}
                  <div className="collapse collapse-arrow bg-base-300 rounded-lg mb-4">
                    <input type="checkbox" />
                    <div className="collapse-title text-lg font-medium">
                      View Raw JSON Data
                    </div>
                    <div className="collapse-content">
                      <pre className="whitespace-pre-wrap text-base-content p-4 bg-base-200 rounded-lg max-h-96 overflow-y-auto">
                        {/* Check if it's a string, otherwise JSON.stringify the object */}
                        {typeof generatedResume === 'string' 
                          ? generatedResume 
                          : JSON.stringify(generatedResume, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  {/* Quick Summary of Generated Data */}
                  {parsedResumeData && !parsedResumeData.rawContent && (
                    <div className="bg-base-100 p-4 rounded-lg border border-base-300">
                      <h4 className="font-bold text-lg mb-3">Generated Resume Contains:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Access nested properties with optional chaining */}
                        {parsedResumeData.personalInformation?.fullName && (
                          <div className="badge badge-primary p-3">
                            Name: {parsedResumeData.personalInformation.fullName}
                          </div>
                        )}
                        
                        {parsedResumeData.education?.degree?.title && (
                          <div className="badge badge-secondary p-3">
                            Education: {parsedResumeData.education.degree.title}
                          </div>
                        )}
                        
                        {parsedResumeData.projects?.length > 0 && (
                          <div className="badge badge-accent p-3">
                            Projects: {parsedResumeData.projects.length}
                          </div>
                        )}
                        
                        {parsedResumeData.workExperience?.length > 0 && (
                          <div className="badge badge-info p-3">
                            Experience: {parsedResumeData.workExperience.length} positions
                          </div>
                        )}
                        
                        {parsedResumeData.skills?.length > 0 && (
                          <div className="badge badge-success p-3">
                            Skills: {parsedResumeData.skills.length} listed
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {parsedResumeData?.rawContent && (
                    <div className="badge badge-warning p-3">
                      Warning: Raw Text Content was received (not valid JSON). Cannot Preview.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-4 bg-base-300 rounded-lg w-full text-left">
            <h4 className="font-bold text-lg mb-2">💡 Tips for Best Results:</h4>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Include your job titles and years of experience</li>
              <li>List your technical skills and tools you're proficient with</li>
              <li>Mention your education and certifications</li>
              <li>Describe key projects you've worked on</li>
              <li>Include achievements and awards</li>
              <li>Be specific about your responsibilities</li>
            </ul>
          </div>

        </div>
        
        {/* Footer or other parts of the card can go here */}
      </div>
    </div>
  );
};

export default GenerateResume;