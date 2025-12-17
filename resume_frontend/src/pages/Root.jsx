import React from 'react'; 
import { Outlet } from 'react-router-dom'; // Assuming 'Outlet' is used from react-router-dom
import NavBar from '../components/NavBar.jsx';
function Root(){
    return (
        <div>
            {/* navbar */}
            <NavBar />
            {/* outlet */}

            <Outlet />
        </div>
    ); // Removed the semicolon here
}
export default Root;