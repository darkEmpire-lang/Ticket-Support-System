import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const { token, setToken, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onsubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (currentState === 'Sign up') {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        if (profilePic) {
          formData.append('profilePic', profilePic);
        }

        const response = await axios.post(`http://localhost:4000/api/user/register`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success('Registration successful! You are now logged in.');
          navigate('/submit-ticket');
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(`http://localhost:4000/api/user/login`, { email, password });

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem('token', response.data.token);
          toast.success('Login successful!');
          navigate('/submit-ticket');
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred.');
    }
  };

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  return (
    <form onSubmit={onsubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800">
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="text-3xl">{currentState}</p>
      </div>

      {currentState === 'Sign up' && (
        <>
          <div className="relative flex flex-col items-center">
            <label className="w-24 h-24 flex items-center justify-center rounded-full border-2 border-gray-400 cursor-pointer overflow-hidden">
              {preview ? <img src={preview} alt="Profile Preview" className="w-full h-full object-cover rounded-full" /> : <span className="text-gray-500 text-sm">Upload</span>}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <p className="text-sm text-gray-500 mt-2">Click to upload profile picture</p>
          </div>

          <input onChange={(e) => setName(e.target.value)} value={name} className="w-full px-3 py-2 border border-gray-800" type="text" placeholder="Name" required />
        </>
      )}

      <input onChange={(e) => setEmail(e.target.value)} value={email} className="w-full px-3 py-2 border border-gray-800" type="email" placeholder="Email" required />
      <input onChange={(e) => setPassword(e.target.value)} value={password} className="w-full px-3 py-2 border border-gray-800" type="password" placeholder="Password" required />

      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer">Forgot password?</p>
        {currentState === 'Login' ? (
          <p onClick={() => setCurrentState('Sign up')} className="cursor-pointer">Create account</p>
        ) : (
          <p onClick={() => setCurrentState('Login')} className="cursor-pointer">Login here</p>
        )}
      </div>

      <button className="bg-black text-white font-light px-8 py-2 mt-4">{currentState === 'Login' ? 'Sign In' : 'Sign up'}</button>
    </form>
  );
};

export default Login;
