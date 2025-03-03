import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 text-center p-4 text-sm shadow-inner">
      <p>&copy; {new Date().getFullYear()} ISM3 v2. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer;
