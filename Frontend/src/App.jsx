import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "react-toastify/dist/ReactToastify.css";
import AdminTicketsPage from "../../Admin/src/TicketSupportAdmin/AdminTicketsPage ";
import MyTickets from "./TicketsupportManagement/MyTickets";
import Profile from "./TicketsupportManagement/Profile";
import TicketRaisePage from "./TicketsupportManagement/TicketRaisePage";

const App = () => {
  const location = useLocation();

  console.log(location.pathname); // Debugging the pathname

  return (
    <div className="px-4 sm:px-[5vw] md:px [7vw] lg:px-[9vw ]">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/submit-ticket" element={<TicketRaisePage />} />
        <Route path="/admin-tickets" element={<AdminTicketsPage />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
    </div>
  );
};

export default App;
