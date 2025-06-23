import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bookingBg from './../assets/booking-2.jpg'; // Use the same image as login
import { baseUrl } from '../constant/BaseUrl';

const signupApi = async (userData) => {
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Signup failed');
  }

  localStorage.setItem('token', data.token); // Save token if your backend returns it
  return data;
};

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    username: '',
    password: '',
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: signupApi,
    onSuccess: (data) => {
      alert('Signup successful!');
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
      navigate('/');
    },
    onError: (err) => {
      alert(err.message);
    },
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div
      className="h-screen w-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bookingBg})` }}
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-10 p-8 rounded-2xl backdrop-blur-md shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Signup</h2>

        {['email', 'phone', 'username', 'password'].map((field) => (
          <input
            key={field}
            name={field}
            type={field === 'password' ? 'password' : 'text'}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            value={formData[field]}
            onChange={handleChange}
            className="w-full p-3 mb-4 rounded-md border-2 bg-white bg-opacity-20 text-black placeholder-black"
          />
        ))}

        <button
          type="submit"
          className="w-full py-3 mt-4 bg-blue-600 hover:bg-blue-800 text-white font-bold rounded-lg transition-all"
        >
          Sign Up
        </button>

        {/* ✅ Login Link */}
        <p className="text-center mt-4 text-black-600">
          Already a user?{' '}
          <a href="/login" className="text-blue-300 underline hover:text-blue-500">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
