// components/Navbar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase-config';

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      alert("Error al cerrar sesión: " + error.message);
    }
  };

  return (
    <AppBar position="sticky" color="primary" sx={{ boxShadow: 4 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 'bold'
          }}
        >
          ISM3 v2
        </Typography>

        {/* Menú para pantallas medianas y grandes */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          <Button component={Link} to="/evaluacion" sx={{ color: 'inherit', fontWeight: 'bold' }}>
            Evaluación
          </Button>
          <Button component={Link} to="/reportes" sx={{ color: 'inherit', fontWeight: 'bold' }}>
            Reportes
          </Button>
          <Button
            onClick={handleSignOut}
            sx={{
              backgroundColor: 'error.main',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: 'error.dark' }
            }}
          >
            Cerrar sesión
          </Button>
        </Box>

        {/* Menú para pantallas pequeñas */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem component={Link} to="/evaluacion" onClick={handleMenuClose}>
              Evaluación
            </MenuItem>
            <MenuItem component={Link} to="/reportes" onClick={handleMenuClose}>
              Reportes
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose();
                handleSignOut();
              }}
            >
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
