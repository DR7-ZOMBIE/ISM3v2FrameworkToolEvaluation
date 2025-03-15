// components/HeroSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

const HeroSection = () => {
  return (
    <>
      {/* Sección Hero */}
      <Box
        sx={{
          backgroundImage: "url('https://source.unsplash.com/1600x900/?cybersecurity,technology')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <Paper
          elevation={12}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            p: { xs: 2, sm: 4, md: 8 },
            borderRadius: 4,
            textAlign: 'center',
            width: { xs: '90%', sm: '80%', md: '60%' },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            Bienvenido a ISM3 v2
          </Typography>

          <Typography
            variant="body1"
            component="p"
            gutterBottom
            sx={{
              color: 'text.secondary',
              mb: 3,
              lineHeight: 1.6,
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.125rem' },
            }}
          >
            Basado en el <strong>Estándar Open Group</strong>, ISM3 v2 es un modelo avanzado
            de madurez en gestión de seguridad de la información diseñado para evaluar y mejorar
            continuamente los procesos críticos de seguridad en tu organización.
            <br /><br />
            Este marco integral no solo permite medir la efectividad de controles, sino que
            también establece objetivos claros y prioriza inversiones, alineando la seguridad
            con las metas estratégicas del negocio.
            <br /><br />
            Con referencias a estándares internacionales como ISO 27001, NIST Cybersecurity
            Framework y COBIT, ISM3 v2 ofrece una metodología basada en procesos y métricas
            objetivas, facilitando la toma de decisiones informada y la mejora continua del
            Sistema de Gestión de Seguridad de la Información (ISMS).
          </Typography>

          {/* Botón para iniciar evaluación */}
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

      {/* Sección de la tabla (debajo del Hero) */}
      <Box sx={{ p: { xs: 2, sm: 4 }, backgroundColor: '#f5f5f5' }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            mb: 2,
            textAlign: 'center',
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          Cuadro de equivalencia de métricas ISM3 v2
        </Typography>
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            maxWidth: { xs: '100%', sm: 700 },
            mx: 'auto',
            backgroundColor: 'white',
            overflowX: 'auto'
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: 'primary.main' }}>
              <TableRow>
                <TableCell
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '1rem' }
                  }}
                  align="center"
                >
                  Rango (ISM3 v2)
                </TableCell>
                <TableCell
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '1rem' }
                  }}
                  align="center"
                >
                  Descripción ISM3
                </TableCell>
                <TableCell
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: { xs: '0.75rem', sm: '1rem' }
                  }}
                  align="center"
                >
                  Otras Referencias
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Fila 1 */}
              <TableRow>
                <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                  95 - 100
                </TableCell>
                <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                  Cumple
                </TableCell>
                <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                  Cumple plenamente la meta (90% - 100%)
                </TableCell>
              </TableRow>
              {/* Fila 2 */}
              <TableRow>
                <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                  85 - 94
                </TableCell>
                <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                  Cumple parcialmente
                </TableCell>
                <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                  Cumple en alto grado la meta (80% - 90%)
                </TableCell>
              </TableRow>
              {/* Fila 3 */}
              <TableRow>
                <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                  1 - 84
                </TableCell>
                <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                  No cumple
                </TableCell>
                <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                  No cumple la meta (&lt;85%)
                  <br />
                  Conocimiento deficiente (40% - 60%)
                  <br />
                  Conocimiento aceptable (70% - 80%)
                </TableCell>
              </TableRow>
              {/* Fila 4 */}
              <TableRow>
                <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                  0
                </TableCell>
                <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                  No medido
                </TableCell>
                <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                  No aplica / Sin datos
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default HeroSection;
