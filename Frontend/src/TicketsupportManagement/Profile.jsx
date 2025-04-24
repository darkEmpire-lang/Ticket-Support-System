import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";

const Profile = () => {
  const { token, backendUrl } = useContext(ShopContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data.user);
      } catch (error) {
        setProfile(null);
      }
    };
    fetchProfile();
  }, [token, backendUrl]);

  if (!profile) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-lg shadow-lg flex flex-col items-center">
      <img src={profile.profilePic} alt="Profile" className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover mb-4" />
      <h2 className="text-2xl font-bold mb-2">{profile.name}</h2>
      <p className="text-gray-700 mb-1">{profile.email}</p>
   
    </div>

  );
};

export default Profile;
