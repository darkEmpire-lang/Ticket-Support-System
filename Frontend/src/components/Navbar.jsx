import React, { useContext, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import {
  User,
  CalendarCheck,
  MessageSquare,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { assets } from "../assets/assets"; // Import assets

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [profileDropdown, setProfileDropdown] = useState(false);
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const [clicked, setClicked] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  const { getCartCount, setcartItems } = useContext(ShopContext);

  useEffect(() => {
    if (!token) return;
    
    axios
      .get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) setUser(res.data.user);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setToken(null);
        navigate("/login");
      });
  }, [token, backendUrl, navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setcartItems({});
    setProfileDropdown(false);
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between py-5 font-extrabold relative">
      {/* Logo */}
      <Link to="/">
        <img
          src={assets.flogo}
          className="w-full sm:w-44 md:w-48 max-w-xs mx-auto transition-all hover:scale-110 object-contain"
          alt="Logo"
        />
      </Link>

      {/* Navbar Links */}
      <ul className="hidden sm:flex gap-8 text-sm text-gray-700">
        {["Home", "About", "Contact"].map((item) => (
          <NavLink
            key={item}
            to={`/${item.toLowerCase()}`}
            className="hover:text-blue-600 transition-all duration-300"
          >
            {item}
          </NavLink>
        ))}

        {/* Services Dropdown */}
        <div className="relative">
          <p className="cursor-pointer hover:text-blue-600 transition-all duration-300">
            Services
          </p>
        </div>
      </ul>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Cart Icon */}
        <Link to="/cart" className="relative">
          <img
            src={assets.cart_icon}
            className="w-5 cursor-pointer transition-all hover:scale-110"
            alt="Cart Icon"
          />
          <p className="absolute right-[-5px] bottom-[-5px] w-4 text-center bg-black text-white rounded-full text-[8px]">
            {getCartCount()}
          </p>
        </Link>

        {/* Profile Section */}
        <div className="relative profile-dropdown">
          {user ? (
            // Logged-in User Profile Picture
            <img
              src={user.profilePic || assets.profile_icon}
              className="w-10 h-10 rounded-full object-cover cursor-pointer transition-all hover:scale-110"
              alt="Profile Icon"
              onClick={() => setProfileDropdown(!profileDropdown)}
            />
          ) : (
            // Default Profile Icon for Unregistered Users
            <div 
            className="relative flex items-center justify-center"
            onMouseEnter={() => !clicked && setShowTooltip(true)}
            onMouseLeave={() => !clicked && setShowTooltip(false)}
          >
            {/* Profile Icon */}
            <img
              src={assets.profile_icon}
              className="w-6 h-7 rounded-full cursor-pointer transition-all duration-300 hover:scale-110"
              alt="Profile Icon"
              onClick={() => {
                setShowTooltip(false);
                setClicked(true);
                navigate("/login");
              }}
            />
      
            {/* Tooltip (Register Text) */}
            {showTooltip && (
              <div className="absolute bottom-full mt-6 px-3 py-1 bg-black text-white text-sm font-semibold rounded-md shadow-md animate-fadeIn">
                Register
              </div>
            )}
          </div>
          )}

          {/* Dropdown Menu for Logged-in Users */}
          {user && profileDropdown && (
            <div className="absolute right-0 mt-3 w-44 bg-white shadow-md rounded-md p-3 text-gray-700">
              <p
                onClick={() => navigate("/profile")}
                className="cursor-pointer p-2 hover:bg-blue-100 rounded-md flex items-center gap-2"
              >
                <User className="w-4 h-4 text-gray-600" /> My Profile
              </p>

              <p
                onClick={() => navigate("/submit-ticket")}
                className="cursor-pointer p-2 hover:bg-blue-100 rounded-md flex items-center gap-2"
              >
                <LifeBuoy className="w-4 h-4 text-gray-600" /> Raise A Ticket
              </p>


              
              <p
                onClick={() => navigate("/my-tickets")}
                className="cursor-pointer p-2 hover:bg-blue-100 rounded-md flex items-center gap-2"
              >
                <LifeBuoy className="w-4 h-4 text-gray-600" /> My Ticket
              </p>


           

              <p
                onClick={logout}
                className="cursor-pointer p-2 text-red-500 hover:bg-red-100 rounded-md flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-red-500" /> Logout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
