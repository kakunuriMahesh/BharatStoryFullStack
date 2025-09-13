import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { ButtonLoader } from '../components/Loader';

const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      console.log('Attempting login with:', { username, password });
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { username, password });
      Cookies.set('token', response.data.token, { expires: 1 }); // 1 day
      setIsAuthenticated(true);
      console.log('Login successful, token:', response.data.token);
      navigate('/'); // Redirect to homepage
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="border p-2 mb-4 w-full"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2 mb-4 w-full"
        />
        <ButtonLoader 
          type="submit" 
          loading={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          Login
        </ButtonLoader>
      </form>
    </div>
  );
};

export default Login;




// -----this is before DB connection----- for admin login




// import React, { useState } from 'react';
// import axios from 'axios';
// import Cookies from 'js-cookie';
// import { useNavigate } from 'react-router-dom'; // Add this

// const Login = ({ setIsAuthenticated }) => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate(); // Add this

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       console.log('Attempting login with:', { username, password });
//       const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { username, password });
//       Cookies.set('token', response.data.token, { expires: 1 }); // 1 day
//       setIsAuthenticated(true);
//       console.log('Login successful, token:', response.data.token);
//       navigate('/'); // Redirect to homepage
//     } catch (err) {
//       console.error('Login error:', err.response?.data || err.message);
//       setError(err.response?.data?.error || 'Login failed');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-96">
//         <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
//         {error && <p className="text-red-500 mb-4">{error}</p>}
//         <input
//           type="text"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           placeholder="Username"
//           className="border p-2 mb-4 w-full"
//         />
//         <input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Password"
//           className="border p-2 mb-4 w-full"
//         />
//         <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
//           Login
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Login;