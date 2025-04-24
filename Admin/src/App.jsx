import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import AdminDashboard from "./TicketSupportAdmin/AdminDashboard";


const App = () => {
  const location = useLocation();

  console.log(location.pathname); // Debugging the pathname

  return (
    <div className="px-4 sm:px-[5vw] md:px [7vw] lg:px-[9vw ]">
    

      <Routes>
       

       

        
        <Route path="/" element={<AdminDashboard />} />
     
      </Routes>
     
    </div>
  );
};

export default App;
