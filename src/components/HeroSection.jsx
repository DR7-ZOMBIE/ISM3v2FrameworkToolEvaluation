// components/HeroSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Box, Typography, Button, Paper } from '@mui/material';

const HeroSection = () => {
  return (
    <Box
      sx={{
        backgroundImage: "url('https://source.unsplash.com/1600x900/?cybersecurity,technology')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={12}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          p: { xs: 3, sm: 6, md: 8 },
          borderRadius: 4,
          textAlign: 'center',
          maxWidth: 800,
          mx: 2,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Bienvenido a ISM3 v2
        </Typography>
        <Typography variant="h6" component="p" gutterBottom sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
          Basado en el <strong>Estándar Open Group</strong>, ISM3 v2 es un modelo avanzado de madurez en gestión de seguridad de la información diseñado para evaluar y mejorar continuamente los procesos críticos de seguridad en tu organización.
          <br /><br />
          Este marco integral no solo permite medir la efectividad de controles, sino que también establece objetivos claros y prioriza inversiones, alineando la seguridad con las metas estratégicas del negocio.
          <br /><br />
          Con referencias a estándares internacionales como ISO 27001, NIST Cybersecurity Framework y COBIT, ISM3 v2 ofrece una metodología basada en procesos y métricas objetivas, facilitando la toma de decisiones informada y la mejora continua del Sistema de Gestión de Seguridad de la Información (ISMS).
        </Typography>
        <Button
          component={Link}
          to="/evaluacion"
          variant="contained"
          color="primary"
          size="large"
          sx={{ mt: 3, px: 5, py: 1.5 }}
        >
          Iniciar Evaluación
        </Button>
      </Paper>
    </Box>
  );
};

export default HeroSection;
