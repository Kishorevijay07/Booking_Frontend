import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";

import { useState } from 'react';
import bookingBg from './../assets/booking-2.jpg'; // ✅ Import image
import { useNavigate } from 'react-router-dom';
import { baseUrl } from "../constant/BaseUrl";

const loginApi = async (userData) => {
  console.log(userData)
  const res = await fetch(`${baseUrl}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData),
});

const data = await res.json();
console.log("data.Token : ",data.token)
localStorage.setItem('token', data.token); // Save JWT
return data;
};


const Login = () => {

  const Nav=useNavigate();
	const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      console.log(data.user)
      alert('Login successful!');
      Nav('/')
      queryClient.invalidateQueries({ //refetch the authUser 
				queryKey : ["authUser"]
			})

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
      style={{ backgroundImage: `url(${bookingBg})` }} // ✅ Use imported image
    >
      <form
        onSubmit={handleSubmit}
        className="bg-white bg-opacity-10 p-8 rounded-2xl backdrop-blur-md shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-green-600 mb-6">Login Page</h2>

        {['email', 'password'].map((field) => (
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
          className="w-full py-3 mt-4 bg-green-600 hover:bg-green-800 text-white font-bold rounded-lg transition-all"
        >
          Log In
        </button>

        {/* ✅ Signup Link */}
        <p className="text-center mt-4 text-black-600">
          New user?{' '}
          <a href="/signup" className="text-blue-300 underline hover:text-blue-500">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;
