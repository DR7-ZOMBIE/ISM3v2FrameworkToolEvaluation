// components/HeroSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section
      className="bg-cover bg-center h-screen flex items-center justify-center"
      style={{ backgroundImage: "url('https://source.unsplash.com/1600x900/?technology,abstract')" }}
    >
      <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-10 rounded-lg shadow-lg text-center max-w-3xl mx-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4">
          Bienvenido a ISM3 v2
        </h1>
        <p className="text-lg text-blue-900 mb-8">
          ISM3 v2 es un modelo de evaluación de maduración del riesgo que integra auditorías de controles y análisis de seguridad para medir la efectividad de las medidas de protección en tu organización. Nuestra herramienta interactiva y visual te ayuda a identificar áreas de mejora, optimizar la gestión del riesgo y tomar decisiones estratégicas basadas en datos precisos.
        </p>
        <Link to="/evaluacion">
          <button className="bg-yellow-200 hover:bg-yellow-300 text-yellow-900 font-bold py-2 px-6 rounded transition-colors duration-200">
            Iniciar Evaluación
          </button>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
