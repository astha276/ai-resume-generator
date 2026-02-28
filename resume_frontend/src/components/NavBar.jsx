import React from 'react';
import { FaHistory } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function NavBar(){
    return (
        <div className="navbar shadow bg-base-100">
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                        </svg>
                    </div>
                    <ul tabIndex="-1" className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                        <li><Link to="/home">Home</Link></li>
                        <li><Link to="/about">About</Link></li>
                        <li><Link to="/services">Services</Link></li>
                        <li><Link to="/contact">Contact Us</Link></li>
                        {/* History link in mobile menu */}
                        <li><Link to="/resume-history" className="flex items-center gap-2"><FaHistory />History</Link></li>
                    </ul>
                </div>
                <Link to="/" className="btn btn-ghost text-xl">AI Resume Maker</Link>
            </div>
            
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    <li><Link to="/home">Home</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/services">Services</Link></li>
                    <li><Link to="/contact">Contact Us</Link></li>
                </ul>
            </div>
            
            <div className="navbar-end flex items-center gap-2">
                {/* History link for desktop */}
                <Link 
                    to="/resume-history" 
                    className="hidden lg:flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
                >
                    <FaHistory />
                    <span>History</span>
                </Link>
                
                <Link to="/Login" className="btn btn-ghost">Login</Link>
            </div>
        </div>
    );
}

export default NavBar;