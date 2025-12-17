import React from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for reaching out! This is a demo form.");
  };

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* --- PAGE HEADER --- */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-primary mb-4">Get In Touch</h1>
          <p className="text-lg text-base-content/70">
            Have questions about the AI Resume Builder? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* --- CONTACT INFO CARDS --- */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
            
            <div className="card bg-base-100 shadow-md flex-row p-6 items-center gap-6 border-l-4 border-primary">
              <div className="bg-primary/10 p-4 rounded-full text-primary">
                <FaEnvelope size={24} />
              </div>
              <div>
                <h3 className="font-bold">Email Us</h3>
                <p className="text-base-content/70">support@airesumebuilder.com</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-md flex-row p-6 items-center gap-6 border-l-4 border-secondary">
              <div className="bg-secondary/10 p-4 rounded-full text-secondary">
                <FaPhoneAlt size={24} />
              </div>
              <div>
                <h3 className="font-bold">Call Us</h3>
                <p className="text-base-content/70">+1 (555) 000-RESUME</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-md flex-row p-6 items-center gap-6 border-l-4 border-accent">
              <div className="bg-accent/10 p-4 rounded-full text-accent">
                <FaMapMarkerAlt size={24} />
              </div>
              <div>
                <h3 className="font-bold">Our Headquarters</h3>
                <p className="text-base-content/70">123 Tech Plaza, San Francisco, CA 94105</p>
              </div>
            </div>

            {/* Social Links Section */}
            <div className="pt-6">
              <h3 className="font-semibold mb-4">Follow Our Updates</h3>
              <div className="flex gap-4">
                <button className="btn btn-circle btn-outline btn-primary"><FaTwitter size={20}/></button>
                <button className="btn btn-circle btn-outline btn-primary"><FaLinkedin size={20}/></button>
                <button className="btn btn-circle btn-outline btn-primary"><FaGithub size={20}/></button>
              </div>
            </div>
          </div>

          {/* --- CONTACT FORM --- */}
          <div className="card bg-base-100 shadow-2xl">
            <form onSubmit={handleSubmit} className="card-body gap-4">
              <h2 className="card-title text-2xl mb-4">Send a Message</h2>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input type="text" placeholder="Alex Harrison" className="input input-bordered focus:input-primary" required />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email Address</span>
                </label>
                <input type="email" placeholder="alex@example.com" className="input input-bordered focus:input-primary" required />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Subject</span>
                </label>
                <select className="select select-bordered focus:select-primary">
                  <option disabled selected>How can we help?</option>
                  <option>General Inquiry</option>
                  <option>Technical Support</option>
                  <option>Billing Question</option>
                  <option>Feature Request</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Your Message</span>
                </label>
                <textarea className="textarea textarea-bordered h-32 focus:textarea-primary" placeholder="Tell us more..."></textarea>
              </div>

              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary">Send Message</button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Contact;