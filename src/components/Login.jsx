// components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineUser, AiOutlineLock } from 'react-icons/ai';
import { FcGoogle } from 'react-icons/fc';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase-config'; // Asegúrate de que este archivo esté correctamente configurado

const Login = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, credentials.username, credentials.password);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      alert("Error al iniciar sesión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsAuthenticated(true);
      navigate('/');
    } catch (error) {
      alert("Error al iniciar sesión con Google: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="bg-white/80 backdrop-blur-md p-10 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-2">
          Bienvenid@ a ISM3 v2
        </h2>
        <p className="text-center text-gray-600 mb-8">Inicia sesión para continuar</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
              <AiOutlineUser size={24} />
            </span>
            <input
              type="email"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="Correo electrónico"
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
              required
            />
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
              <AiOutlineLock size={24} />
            </span>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Contraseña"
              className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-gradient-to-r from-pink-300 to-purple-300 text-white font-semibold shadow-lg hover:from-pink-400 hover:to-purple-400 transition duration-300"
          >
            {loading ? "Cargando..." : "Entrar"}
          </button>
        </form>
        <div className="mt-6 flex items-center justify-center">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex items-center space-x-2 border border-gray-300 rounded-full px-4 py-2 hover:bg-gray-100 transition"
          >
            <FcGoogle size={24} />
            <span className="text-gray-700">Iniciar sesión con Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
