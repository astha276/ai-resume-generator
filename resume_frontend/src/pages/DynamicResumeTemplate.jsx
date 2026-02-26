import React, { useRef } from 'react';
import { 
  FaEnvelope, 
  FaPhone, 
  FaLinkedin, 
  FaGithub, 
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTrophy,
  FaGlobe,
  FaAward,
  FaDownload,
  FaPrint,
  FaCode,
  FaBriefcase,
  FaGraduationCap
} from 'react-icons/fa';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DynamicResumeTemplate = ({ jsonData }) => {
  const resumeRef = useRef(null);

  if (!jsonData) {
    return <div className="text-center p-4">No resume data available to display.</div>;
  }

  // Handle the nested structure - data is inside a "resume" object
  const data = jsonData.resume || jsonData;
  
  // Extract all sections
  const personalInfo = data.personalInformation || {};
  const skills = data.skills || [];
  const summary = data.summary || '';
  const education = data.education || {};
  const portfolio = data.portfolio || [];
  const experience = data.experience || [];
  const certifications = data.certifications || {};
  const achievements = jsonData.achievements || [];
  const languages = jsonData.languages || [];
  const interests = jsonData.interests || [];

  // Format certifications
  const certificationsList = [];
  if (certifications.certification) {
    const certArray = Array.isArray(certifications.certification) 
      ? certifications.certification 
      : [certifications.certification];
    
    certArray.forEach((cert, index) => {
      certificationsList.push({
        title: cert,
        year: certifications.year?.[index] || '',
        issuer: certifications.issuingOrganization?.[index] || ''
      });
    });
  }

  const downloadAsPDF = async () => {
  if (!resumeRef.current) return;
  
  try {
    // Use a simpler approach - just use browser's print with PDF destination
    window.print();
    
  } catch (error) {
    console.error('Error:', error);
    alert('Please use the Print button to save as PDF');
  }
};

  return (
    <div className="relative">
      {/* Download Buttons */}
      <div className="sticky top-0 z-10 bg-white shadow-md p-4 mb-6 flex justify-end space-x-4 print:hidden">
        <button
          onClick={downloadAsPDF}
          className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          <FaDownload />
          <span>Download PDF</span>
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          <FaPrint />
          <span>Print</span>
        </button>
      </div>

      {/* Resume Content */}
      <div 
        ref={resumeRef}
        className="bg-white shadow-xl p-8 max-w-4xl mx-auto print:shadow-none font-sans"
      >
        {/* Header */}
        <div className="border-b-4 border-blue-600 pb-6 mb-6">
          <h1 className="text-4xl font-bold text-gray-800">
            {personalInfo.name || 'Your Name'}
          </h1>
          <p className="text-xl text-blue-600 mt-2 font-medium">
            {personalInfo.title || 'Software Developer'}
          </p>
          
          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm text-gray-600">
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-blue-600 flex-shrink-0" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phoneNumber && (
              <div className="flex items-center gap-2">
                <FaPhone className="text-blue-600 flex-shrink-0" />
                <span>{personalInfo.phoneNumber}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-600 flex-shrink-0" />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <FaLinkedin className="text-blue-600 flex-shrink-0" />
                <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                  {personalInfo.linkedin.replace('https://', '')}
                </a>
              </div>
            )}
            {personalInfo.github && (
              <div className="flex items-center gap-2">
                <FaGithub className="text-blue-600 flex-shrink-0" />
                <a href={`https://${personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {personalInfo.github}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-6 bg-blue-600 mr-3"></span>
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed pl-4">{summary}</p>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-6 bg-blue-600 mr-3"></span>
              Technical Skills
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pl-4">
              {skills.map((skill, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <div>
                    <span className="font-medium text-gray-800">{skill.title}</span>
                    {skill.level && (
                      <span className="text-sm text-gray-500 ml-2">({skill.level})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-6 bg-blue-600 mr-3"></span>
              <FaBriefcase className="mr-2 text-blue-600" /> Work Experience
            </h2>
            <div className="space-y-6 pl-4">
              {experience.map((exp, index) => (
                <div key={index} className="border-l-2 border-gray-200 pl-4">
                  <div className="flex flex-wrap justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{exp.jobTitle}</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {exp.duration}
                    </span>
                  </div>
                  <p className="text-blue-600 font-medium mb-2">{exp.company} • {exp.location}</p>
                  <p className="text-gray-700 text-sm leading-relaxed">{exp.responsibility}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects / Portfolio */}
        {portfolio.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-6 bg-blue-600 mr-3"></span>
              <FaCode className="mr-2 text-blue-600" /> Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
              {portfolio.map((project, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-gray-800 mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                  {project.technologiesUsed && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologiesUsed.map((tech, i) => (
                        <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.degree && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-6 bg-blue-600 mr-3"></span>
              <FaGraduationCap className="mr-2 text-blue-600" /> Education
            </h2>
            <div className="pl-4">
              <h3 className="text-lg font-bold text-gray-800">{education.degree}</h3>
              <p className="text-blue-600 font-medium">{education.university}</p>
              <p className="text-sm text-gray-500">{education.location}</p>
              <p className="text-sm text-gray-600 mt-1">Graduation: {education.graduationYear}</p>
            </div>
          </div>
        )}

        {/* Certifications */}
        {certificationsList.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-6 bg-blue-600 mr-3"></span>
              <FaAward className="mr-2 text-blue-600" /> Certifications
            </h2>
            <ul className="space-y-2 pl-4 list-disc">
              {certificationsList.map((cert, index) => (
                <li key={index} className="text-gray-700">
                  <span className="font-medium">{cert.title}</span>
                  {cert.issuer && <span className="text-gray-600"> - {cert.issuer}</span>}
                  {cert.year && <span className="text-gray-500 text-sm ml-2">({cert.year})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-6 bg-blue-600 mr-3"></span>
              <FaTrophy className="mr-2 text-blue-600" /> Achievements
            </h2>
            <div className="space-y-3 pl-4">
              {achievements.map((ach, index) => (
                <div key={index} className="border-b border-gray-100 pb-2 last:border-0">
                  <div className="flex items-start">
                    <span className="text-blue-600 mr-2">🏆</span>
                    <div>
                      <span className="font-medium text-gray-800">{ach.title}</span>
                      {ach.year && <span className="text-gray-500 text-sm ml-2">({ach.year})</span>}
                      {ach.extraInformation && (
                        <p className="text-sm text-gray-600 mt-1">{ach.extraInformation}</p>
                      )}
                      {ach.other && (
                        <p className="text-sm text-gray-600 mt-1">{ach.other}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-6 bg-blue-600 mr-3"></span>
              <FaGlobe className="mr-2 text-blue-600" /> Languages
            </h2>
            <div className="flex flex-wrap gap-3 pl-4">
              {languages.map((lang, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                  {lang.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-6 bg-blue-600 mr-3"></span>
              Interests
            </h2>
            <div className="flex flex-wrap gap-2 pl-4">
              {interests.map((interest, index) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {interest.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicResumeTemplate;