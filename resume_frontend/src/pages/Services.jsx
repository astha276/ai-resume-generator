import React from "react";
import { Link } from "react-router-dom";
import { 
  FaMagic, 
  FaFileDownload, 
  FaRocket,
  FaSearchDollar, 
  FaMobileAlt, 
  FaShieldAlt, 
  FaHistory 
} from "react-icons/fa";

function Services() {
  const serviceList = [
    {
      title: "AI Resume Rewriting",
      description: "Our LLM-powered engine rewrites your bullet points to focus on impact and metrics, ensuring you sound like a top-tier candidate.",
      icon: <FaMagic />,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      title: "ATS Optimization",
      description: "We structure your data using industry-standard headers and layouts that parsing software can read without errors.",
      icon: <FaSearchDollar />,
      color: "text-secondary",
      bg: "bg-secondary/10"
    },
    {
      title: "Multi-Format Export",
      description: "Download your final resume in high-quality PDF format or save the raw JSON data for future updates.",
      icon: <FaFileDownload />,
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      title: "Responsive Templates",
      description: "Every template is designed to look stunning whether viewed on a desktop monitor or a recruiter's smartphone.",
      icon: <FaMobileAlt />,
      color: "text-info",
      bg: "bg-info/10"
    },
    {
      title: "Data Privacy",
      description: "Your personal data is processed securely and never sold. You have full control over your information at all times.",
      icon: <FaShieldAlt />,
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      title: "Version Control",
      description: "Easily create different versions of your resume for different job applications while keeping your master data safe.",
      icon: <FaHistory />,
      color: "text-warning",
      bg: "bg-warning/10"
    }
  ];

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* --- SECTION HEADER --- */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">Our Services</h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Everything you need to stand out in the modern job market, powered by 
            cutting-edge artificial intelligence.
          </p>
        </div>

        {/* --- SERVICES GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceList.map((service, index) => (
            <div 
              key={index} 
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2"
            >
              <div className="card-body items-center text-center">
                <div className={`p-4 rounded-2xl text-3xl mb-4 ${service.bg} ${service.color} group-hover:scale-110 transition-transform`}>
                  {service.icon}
                </div>
                <h2 className="card-title text-xl mb-2">{service.title}</h2>
                <p className="text-base-content/70 leading-relaxed">
                  {service.description}
                </p>
                <div className="card-actions mt-4">
                  <button className="btn btn-ghost btn-sm text-primary group-hover:underline">
                    Learn more
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- CALL TO ACTION --- */}
        <div className="mt-20 p-8 rounded-3xl bg-primary text-primary-content flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2">Ready to boost your career?</h2>
            <p className="opacity-90 italic">Join 10,000+ professionals who landed jobs using our AI tools.</p>
          </div>
          <Link to={'/generate-resume'} className="btn btn-primary btn-lg gap-3">
                Build Your Resume Free
                <FaRocket className="h-5 w-5" />
              </Link>
        </div>

      </div>
    </div>
  );
}

export default Services;