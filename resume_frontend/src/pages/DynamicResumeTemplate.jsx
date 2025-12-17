import React from 'react';
import { 
  FaEnvelope, 
  FaPhone, 
  FaLinkedin, 
  FaGithub, 
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaTrophy, // New icon for Achievements
  FaGlobe, // New icon for Languages
  FaAward // New icon for Certifications
} from 'react-icons/fa';

const DynamicResumeTemplate = ({ jsonData }) => {
  // 1. Safety check: If no data passed, return nothing or a placeholder
  if (!jsonData) {
    return <div className="text-center p-4">No resume data available to display.</div>;
  }

  // 2. Destructure ALL data points with default values and RENAME mismatched keys
  const { 
    personalInformation = {}, 
    // --- CRITICAL FIX 1: Rename 'experience' from JSON to 'workExperience' ---
    experience: workExperience = [], 
    education = [], 
    skills = [], 
    projects = [],
    summary = {}, // Top level summary object
    achievements = [], // NEW: Add achievements
    certifications = [], // NEW: Add certifications
    languages = [] // NEW: Add languages
  } = jsonData;
    
    // Extract the summary text, checking both locations
    const finalSummary = personalInformation.summary || summary.brief_summary || '';


  return (
    <div className="bg-white shadow-xl p-8 md:p-12 max-w-[21cm] mx-auto min-h-[29.7cm] text-gray-800" id="resume-template">
      
      {/* --- HEADER SECTION --- */}
      <header className="border-b-2 border-gray-300 pb-6 mb-6">
        <h1 className="text-4xl font-bold text-gray-900 uppercase tracking-wide">
          {personalInformation.fullName || 'Your Name'}
        </h1>
        {/* Use the jobTitle of the first experience entry as the title if available */}
        <h2 className="text-xl text-blue-700 font-medium mt-2">
          {personalInformation.title || workExperience[0]?.jobTitle || 'Professional Title'}
        </h2>
        
        {/* Contact Info Grid */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
          {personalInformation.email && (
            <div className="flex items-center gap-2">
              <FaEnvelope className="text-blue-600" />
              <span>{personalInformation.email}</span>
            </div>
          )}
          
          {personalInformation.phoneNumber && (
            <div className="flex items-center gap-2">
              <FaPhone className="text-blue-600" />
              <span>{personalInformation.phoneNumber}</span>
            </div>
          )}
          
          {personalInformation.location && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="text-blue-600" />
              <span>{personalInformation.location}</span>
            </div>
          )}
          
          {personalInformation.linkedin && (
            <div className="flex items-center gap-2">
              <FaLinkedin className="text-blue-600" />
              <a href={personalInformation.linkedin} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
            </div>
          )}

        </div>
        
        {/* Summary */}
        {finalSummary && (
          <div className="mt-6">
            <p className="text-gray-700 leading-relaxed">
              {finalSummary}
            </p>
          </div>
        )}
      </header>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (Skills, Education, Languages, Certifications, Achievements) */}
        <div className="col-span-1 space-y-8">
          
          {/* Skills Section */}
          {skills && skills.length > 0 && (
            <section>
              <h3 className="text-lg font-bold border-b-2 border-blue-700 pb-1 mb-3 uppercase">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill.title || skill.name || skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education Section */}
          {education && education.length > 0 && (
            <section>
              <h3 className="text-lg font-bold border-b-2 border-blue-700 pb-1 mb-3 uppercase">
                Education
              </h3>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index}>
                    <h4 className="font-bold text-gray-800">{edu.degree}</h4>
                    <div className="text-blue-600 font-medium">{edu.university}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <FaCalendarAlt />
                      {edu.graduationYear || edu.year || edu.startDate}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* NEW SECTION: Certifications */}
          {certifications && certifications.length > 0 && (
            <section>
              <h3 className="text-lg font-bold border-b-2 border-blue-700 pb-1 mb-3 uppercase flex items-center">
                <FaAward className="mr-2 text-blue-600" /> Certifications
              </h3>
              <ul className="space-y-2 list-disc pl-5 text-sm">
                {certifications.map((cert, index) => (
                  <li key={index}>
                    <span className="font-semibold">{cert.title}</span> 
                    ({cert.issuingOrganization || 'N/A'}) - {cert.year}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* NEW SECTION: Languages */}
          {languages && languages.length > 0 && (
            <section>
              <h3 className="text-lg font-bold border-b-2 border-blue-700 pb-1 mb-3 uppercase flex items-center">
                <FaGlobe className="mr-2 text-blue-600" /> Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {lang.name || lang.language}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN (Experience, Projects, Achievements) */}
        <div className="col-span-1 md:col-span-2 space-y-8">
          
          {/* Work Experience Section */}
          {workExperience && workExperience.length > 0 && (
            <section>
              <h3 className="text-lg font-bold border-b-2 border-blue-700 pb-1 mb-4 uppercase">
                Professional Experience
              </h3>
              <div className="space-y-6">
                {workExperience.map((job, index) => (
                  <div key={index} className="relative pl-4 border-l-2 border-gray-200">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 border-4 border-white"></div>
                    
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-xl font-bold text-gray-800">{job.jobTitle}</h4>
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        {job.duration}
                      </span>
                    </div>
                    
                    <div className="text-lg text-blue-600 font-medium mb-2">{job.company}</div>
                    
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                      {job.responsibility}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects Section (Optional) */}
          {projects && projects.length > 0 && (
            <section>
              <h3 className="text-lg font-bold border-b-2 border-blue-700 pb-1 mb-4 uppercase">
                Projects
              </h3>
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-800">{project.title}</h4>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                    {project.technologiesUsed && (
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold">Tech:</span> {project.technologiesUsed.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* NEW SECTION: Achievements */}
          {achievements && achievements.length > 0 && (
            <section>
              <h3 className="text-lg font-bold border-b-2 border-blue-700 pb-1 mb-4 uppercase flex items-center">
                <FaTrophy className="mr-2 text-blue-600" /> Achievements
              </h3>
              <ul className="space-y-3 list-disc pl-5 text-gray-700">
                {achievements.map((ach, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-semibold">{ach.title} ({ach.year})</span>: {ach.extraInformation}
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default DynamicResumeTemplate;