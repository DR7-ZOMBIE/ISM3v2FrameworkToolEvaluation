// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase-config';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Layout from './components/Layout';
import HeroSection from './components/HeroSection';
import Evaluacion from './components/Evaluacion';
import Reportes from './components/Reportes';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
    });
    return unsubscribe;
  }, []);

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <>
          <Navbar setIsAuthenticated={setIsAuthenticated} />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HeroSection />} />
              <Route path="evaluacion" element={<Evaluacion />} />
              <Route path="reportes" element={<Reportes />} />
              {/* Otras rutas protegidas */}
            </Route>
          </Routes>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
