import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Evaluacion from './components/Evaluacion';
import Reportes from './components/Reportes';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/evaluacion" element={<Evaluacion />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
