import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-900 p-6 shadow-inner">
      <Container maxWidth="lg">
        <Box textAlign="center">
          <Typography variant="body2" color="text.secondary" align="center">
            &copy; {new Date().getFullYear()}{' '}
            <Link href="/" color="inherit">
              ISM3 v2
            </Link>. Todos los derechos reservados.
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
            <Link href="/privacy-policy" color="inherit" sx={{ mx: 2 }}>
              Política de Privacidad
            </Link>
            <Link href="/terms-of-service" color="inherit" sx={{ mx: 2 }}>
              Términos de Servicio
            </Link>
          </Typography>
        </Box>
      </Container>
    </footer>
  );
};

export default Footer;
