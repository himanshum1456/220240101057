import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';

import ShortenerPage from './pages/ShortenerPage';
import StatsPage from './pages/StatsPage';
import RedirectHandler from './pages/RedirectHandler';
import { logger } from './logger/AffordLogger';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8ab4f8' },
    secondary: { main: '#a78bfa' },
    background: { default: '#0b1020', paper: '#141a2a' },
    text: { primary: '#e6e9ef', secondary: '#9aa4b2' }
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(20,26,42,0.9)',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.35)'
        }
      }
    },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600 } } }
  },
  typography: { h4: { fontWeight: 800, letterSpacing: 0.2 } }
});

const App: React.FC = () => {
  React.useEffect(() => {
    logger.info('App', 'Application started');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ flexGrow: 1, minHeight: '100vh', background:
          'radial-gradient(1200px 600px at 10% -10%, rgba(88,28,135,0.25), transparent), radial-gradient(1000px 500px at 100% 0%, rgba(14,165,233,0.18), transparent), linear-gradient(180deg, #0b1020 0%, #0b1020 100%)' }}>
          <AppBar position="static" elevation={0} sx={{ background: 'transparent', backdropFilter: 'saturate(180%) blur(6px)' }}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                URL Shortener
              </Typography>
              <Link
                component={RouterLink}
                to="/"
                color="inherit"
                sx={{ mr: 2, textDecoration: 'none', fontWeight: 600 }}
              >
                Shorten
              </Link>
              <Link
                component={RouterLink}
                to="/stats"
                color="inherit"
                sx={{ textDecoration: 'none', fontWeight: 600 }}
              >
                Statistics
              </Link>
            </Toolbar>
          </AppBar>
          
          <Container maxWidth="md" sx={{ py: 6 }}>
            <Routes>
              <Route path="/" element={<ShortenerPage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/:shortcode" element={<RedirectHandler />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
