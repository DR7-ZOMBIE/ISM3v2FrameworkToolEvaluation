// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Evaluacion from './components/Evaluacion';
// Importa tus otros componentes según corresponda:
import Reportes from './components/Reportes';
// import Contacto from './components/Contacto';
import Footer from './components/Footer';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Ruta principal, por ejemplo, la home con el hero */}
        <Route path="/" element={<HeroSection />} />
        <Route path="/evaluacion" element={<Evaluacion />} />
        {<Route path="/reportes" element={<Reportes />} />}
        {/* // <Route path="/contacto" element={<Contacto />} />  */}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
