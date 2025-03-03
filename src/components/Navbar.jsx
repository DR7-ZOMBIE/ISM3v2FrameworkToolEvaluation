// components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 shadow-md sticky top-0 z-50">
      <div className="text-2xl font-extrabold">
        <Link to="/" className="transition-colors duration-200 hover:text-blue-700">
          ISM3 v2
        </Link>
      </div>
      <ul className="flex space-x-6">
       
        <li>
          <Link to="/evaluacion" className="transition-colors duration-200 hover:text-blue-700">
            Evaluación
          </Link>
        </li>
        <li>
          <Link to="/reportes" className="transition-colors duration-200 hover:text-blue-700">
            Reportes
          </Link>
        </li>
        <li>
          <Link to="/contacto" className="transition-colors duration-200 hover:text-blue-700">
            Contacto
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
