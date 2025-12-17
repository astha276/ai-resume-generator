import React from 'react';
// 🟢 ADD THIS LINE
import { Link } from 'react-router-dom';
import GenerateResume from './GenerateResume';
import { 
  SparklesIcon, 
  RocketLaunchIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  ShieldCheckIcon, 
  BoltIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200">
      
      {/* Navigation */}
      <nav className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl gap-2">
              <SparklesIcon className="h-6 w-6 text-primary" />
              <span className="font-bold">AI Resume</span>
              <span className="text-primary">Maker</span>
            </a>
          </div>
          <div className="flex-none gap-2">
            <a href="#features" className="btn btn-ghost">Features</a>
            <a href="#how-it-works" className="btn btn-ghost">How It Works</a>
            <a href="#testimonials" className="btn btn-ghost">Testimonials</a>
            <button className="btn btn-primary">
              Get Started
              <ArrowRightIcon className="h-4 w-4 ml-2" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero min-h-[80vh] bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <div className="badge badge-primary gap-2 mb-6 p-4">
              <SparklesIcon className="h-4 w-4" />
              AI-Powered Resume Builder
            </div>
            <h1 className="text-5xl md:text-7xl font-bold">
              Create the Perfect Resume with
              <span className="text-primary block mt-2">AI Assistance</span>
            </h1>
            <p className="py-6 text-xl opacity-80">
              Transform your career description into a professional, ATS-friendly resume in minutes. 
              Our AI analyzes your experience and crafts the perfect resume for your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={'/generate-resume'} className="btn btn-primary btn-lg gap-2">
                Build Your Resume Free
                <RocketLaunchIcon className="h-5 w-5" />
              </Link>
              <button className="btn btn-outline btn-lg gap-2">
                <DocumentTextIcon className="h-5 w-5" />
                See Examples
              </button>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat bg-base-100 rounded-2xl shadow">
                <div className="stat-title">Resumes Created</div>
                <div className="stat-value text-primary">10,000+</div>
              </div>
              <div className="stat bg-base-100 rounded-2xl shadow">
                <div className="stat-title">Success Rate</div>
                <div className="stat-value text-secondary">94%</div>
              </div>
              <div className="stat bg-base-100 rounded-2xl shadow">
                <div className="stat-title">Time Saved</div>
                <div className="stat-value text-accent">85%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl opacity-70">Everything you need to create an outstanding resume</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<SparklesIcon className="h-10 w-10" />}
              title="AI-Powered Content"
              description="Our AI generates professional content based on your experience and target job roles."
              color="primary"
            />
            <FeatureCard
              icon={<DocumentTextIcon className="h-10 w-10" />}
              title="ATS Optimization"
              description="Resumes optimized for Applicant Tracking Systems to ensure they get noticed."
              color="secondary"
            />
            <FeatureCard
              icon={<UserGroupIcon className="h-10 w-10" />}
              title="Multiple Templates"
              description="Choose from professionally designed templates for different industries."
              color="accent"
            />
            <FeatureCard
              icon={<ShieldCheckIcon className="h-10 w-10" />}
              title="Real-time Suggestions"
              description="Get instant feedback and improvement suggestions as you build."
              color="primary"
            />
            <FeatureCard
              icon={<BoltIcon className="h-10 w-10" />}
              title="Quick Export"
              description="Export to PDF, DOCX, or share directly with recruiters."
              color="secondary"
            />
            <FeatureCard
              icon={<CheckCircleIcon className="h-10 w-10" />}
              title="Industry Specific"
              description="Tailored content suggestions for different industries and roles."
              color="accent"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl opacity-70">Create your perfect resume in 3 simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Describe Yourself"
              description="Tell us about your experience, skills, and career goals in plain English"
              icon={<UserGroupIcon className="h-8 w-8" />}
            />
            <StepCard
              number="2"
              title="AI Magic"
              description="Our AI analyzes your input and generates professional resume content"
              icon={<SparklesIcon className="h-8 w-8" />}
            />
            <StepCard
              number="3"
              title="Download & Apply"
              description="Customize, export in any format, and start applying to jobs"
              icon={<DocumentTextIcon className="h-8 w-8" />}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands who landed their dream jobs with AI-powered resumes
          </p>
          <Link to={'/generate-resume'} className="btn btn-lg bg-white text-primary hover:bg-white/90 gap-2">
            Create Your Resume Now
            <ArrowRightIcon className="h-5 w-5" />
          </Link>
          <p className="mt-4 text-white/80">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-base-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-xl opacity-70">What our users say about us</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Sarah Johnson"
              role="Software Engineer"
              testimonial="The AI suggestions helped me highlight skills I didn't even think were important. Got 3 interviews in 2 weeks!"
              stars={5}
            />
            <TestimonialCard
              name="Michael Chen"
              role="Marketing Director"
              testimonial="From basic description to executive-level resume in 15 minutes. Absolutely revolutionary!"
              stars={5}
            />
            <TestimonialCard
              name="Emily Rodriguez"
              role="Product Manager"
              testimonial="The ATS optimization feature is a game-changer. My resume now actually gets seen by recruiters."
              stars={5}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer footer-center p-10 bg-base-300 text-base-content">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">AI Resume</span>
              </div>
              <p className="opacity-70">
                Creating better resumes through artificial intelligence
              </p>
            </div>
            
            <div>
              <span className="footer-title">Product</span>
              <a className="link link-hover">Features</a>
              <a className="link link-hover">Templates</a>
              <a className="link link-hover">Pricing</a>
              <a className="link link-hover">API</a>
            </div>
            
            <div>
              <span className="footer-title">Company</span>
              <a className="link link-hover">About us</a>
              <a className="link link-hover">Contact</a>
              <a className="link link-hover">Blog</a>
              <a className="link link-hover">Careers</a>
            </div>
            
            <div>
              <span className="footer-title">Legal</span>
              <a className="link link-hover">Terms of use</a>
              <a className="link link-hover">Privacy policy</a>
              <a className="link link-hover">Cookie policy</a>
            </div>
          </div>
          
          <div className="divider"></div>
          
          <div>
            <p className="opacity-70">
              © {new Date().getFullYear()} AI Resume Maker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component for Feature Cards
const FeatureCard = ({ icon, title, description, color }) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent'
  };

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <div className="card-body">
        <div className={`w-16 h-16 rounded-2xl ${colorClasses[color]} flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="card-title text-2xl mb-3">{title}</h3>
        <p className="opacity-70">{description}</p>
      </div>
    </div>
  );
};

// Component for Step Cards
const StepCard = ({ number, title, description, icon }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body items-center text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-primary text-primary-content rounded-full flex items-center justify-center text-2xl font-bold">
            {number}
          </div>
          <div className="absolute -top-2 -right-2 bg-secondary text-secondary-content p-2 rounded-full">
            {icon}
          </div>
        </div>
        <h3 className="card-title text-2xl mb-3">{title}</h3>
        <p className="opacity-70">{description}</p>
      </div>
    </div>
  );
};

// Component for Testimonial Cards
const TestimonialCard = ({ name, role, testimonial, stars }) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex mb-4">
          {[...Array(stars)].map((_, i) => (
            <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
          ))}
        </div>
        <p className="italic text-lg mb-6">"{testimonial}"</p>
        <div className="flex items-center gap-4">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center font-bold">
              {name.charAt(0)}
            </div>
          </div>
          <div>
            <h4 className="font-bold">{name}</h4>
            <p className="opacity-70">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;