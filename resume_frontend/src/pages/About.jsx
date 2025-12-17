import React from "react";
// Added FaRocket and FaTools to the imports
import { FaRobot, FaFilePdf, FaCode, FaMagic, FaRocket, FaTools } from "react-icons/fa";
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* --- HERO SECTION --- */}
        <section className="hero bg-base-100 rounded-3xl shadow-xl overflow-hidden">
          <div className="hero-content text-center p-10">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-bold text-primary">AI Resume Builder</h1>
              <p className="py-6 text-lg text-base-content/70">
                Our platform leverages advanced Generative AI to transform your raw experience 
                into professional, industry-standard resumes. We bridge the gap between 
                your skills and your dream career.
              </p>
              {/* FIXED: Replaced RocketLaunchIcon with FaRocket */}
              <Link to={'/generate-resume'} className="btn btn-primary btn-lg gap-3">
                Build Your Resume Free
                <FaRocket className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* --- STATS SECTION --- */}
        <div className="stats shadow w-full bg-base-100">
          <div className="stat">
            <div className="stat-figure text-primary">
              <FaRobot size={30} />
            </div>
            <div className="stat-title">AI Powered</div>
            <div className="stat-value text-primary">100%</div>
            <div className="stat-desc">Dynamic Content Generation</div>
          </div>
          
          <div className="stat">
            <div className="stat-figure text-secondary">
              <FaMagic size={30} />
            </div>
            <div className="stat-title">ATS Friendly</div>
            <div className="stat-value text-secondary">Optimized</div>
            <div className="stat-desc">Standard Industry Formatting</div>
          </div>

          <div className="stat">
            <div className="stat-figure text-accent">
              <FaFilePdf size={30} />
            </div>
            <div className="stat-title">Export Formats</div>
            <div className="stat-value">PDF/JSON</div>
            <div className="stat-desc">Ready for applications</div>
          </div>
        </div>

        {/* --- HOW IT WORKS SECTION --- */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FaCode className="text-primary text-2xl" />
                </div>
                <h3 className="card-title text-primary">Input Data</h3>
                <p>Provide your basic details, work history, and achievements in our simple interface.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                  <FaRobot className="text-secondary text-2xl" />
                </div>
                <h3 className="card-title text-secondary">AI Enhancement</h3>
                <p>Our AI processes your data, optimizing descriptions and highlighting key accomplishments.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                  <FaFilePdf className="text-accent text-2xl" />
                </div>
                <h3 className="card-title text-accent">Export & Apply</h3>
                <p>Instantly preview your resume in a beautiful template and download it as a PDF.</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- TECH STACK SECTION --- */}
        <section className="text-center space-y-6 bg-base-100 p-10 rounded-3xl shadow-sm">
          <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
            <FaTools className="text-primary" />
            Built With Modern Tech
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <div className="badge badge-outline p-4">React 18</div>
            <div className="badge badge-outline p-4">Tailwind CSS</div>
            <div className="badge badge-outline p-4">DaisyUI</div>
            <div className="badge badge-outline p-4">Google Gemini AI</div>
            <div className="badge badge-outline p-4">React Router</div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default About;