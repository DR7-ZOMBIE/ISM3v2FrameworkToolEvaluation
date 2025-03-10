// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HeroSection from './components/HeroSection';
import Evaluacion from './components/Evaluacion';
import Reportes from './components/Reportes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HeroSection />} />
          <Route path="evaluacion" element={<Evaluacion />} />
          <Route path="reportes" element={<Reportes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
