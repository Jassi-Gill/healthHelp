import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Box,
  Container,
  Link,
  Grid,
  Avatar,
  Alert,
  AlertTitle,
  CssBaseline,
  CircularProgress
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HospitalDashboard from './hospitalDashboard';
import PatientDashboard from './patientDashboard';
import DriverDashboard from './driverDashboard';
import PoliceDashboard from './policeDashboard';
import SignupPage from './SignupPage';
import MapNav from './mapNav';


const LoginPage = () => {
  const [userType, setUserType] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState('login');
  const [userData, setUserData] = useState(null);
  const [authTokens, setAuthTokens] = useState(null);

  // Check for existing login session on component mount
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const storedTokens = localStorage.getItem('authTokens');
    const storedUserType = localStorage.getItem('userType');

    if (storedUserData && storedTokens && storedUserType) {
      setUserData(JSON.parse(storedUserData));
      setAuthTokens(JSON.parse(storedTokens));
      setCurrentView(`${storedUserType}Dashboard`);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid email or password');
        } else if (response.status === 404) {
          throw new Error('Account not found');
        }
        throw new Error(data.detail || 'Login failed');
      }

      const validUserTypes = ['patient', 'driver', 'hospital', 'police'];
      if (!validUserTypes.includes(data.user_type)) {
        throw new Error('Invalid user type received');
      }

      localStorage.setItem('authTokens', JSON.stringify(data.tokens));
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('userType', data.user_type);

      setAuthTokens(data.tokens);
      setUserData(data.user);
      setCurrentView(`${data.user_type}Dashboard`);
      setEmail('');
      setPassword('');

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fix in useEffect
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const storedTokens = localStorage.getItem('authTokens'); // Fixed key
    const storedUserType = localStorage.getItem('userType');

    if (storedUserData && storedTokens && storedUserType) {
      setUserData(JSON.parse(storedUserData));
      setAuthTokens(JSON.parse(storedTokens));
      setCurrentView(`${storedUserType}Dashboard`);
    }
  }, []);

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('authTokens');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');

    setAuthTokens(null);
    setUserData(null);
    setCurrentView('login');
  };

  const renderDashboard = () => {
    switch (currentView) {
      case 'signup':
        return <SignupPage goToLogin={() => setCurrentView('login')} />;
      case 'patientDashboard':
        return <PatientDashboard
          userData={userData}
          tokens={authTokens}
          logout={handleLogout}
        />;
      case 'driverDashboard':
        return <DriverDashboard
          userData={userData}
          tokens={authTokens}
          logout={handleLogout}
        />;
      case 'hospitalDashboard':
        return <HospitalDashboard
          userData={userData}
          tokens={authTokens}
          logout={handleLogout}
        />;
      case 'policeDashboard':
        return <PoliceDashboard
          userData={userData}
          tokens={authTokens}
          logout={handleLogout}
        />;
      case 'mapNav':
        return <MapNav
          userData={userData}
          tokens={authTokens}
          logout={handleLogout}
        />;
      default:
        return renderLoginForm();
    }
  };

  const renderLoginForm = () => {
    return (
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Emergency Response System
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center">
          Login to access your dashboard
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Login"
            )}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2" onClick={() => setCurrentView('signup')}>
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>

          {/* Quick Access Dashboard Buttons - For development only */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" align="center" gutterBottom>
                Quick Dashboard Access (Dev Only)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={() => setCurrentView('patientDashboard')}
                  >
                    Patient Dashboard
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={() => setCurrentView('mapNav')}
                  >
                    MAAPPPYYY Dashboard
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={() => setCurrentView('driverDashboard')}
                  >
                    Driver Dashboard
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={() => setCurrentView('hospitalDashboard')}
                  >
                    Hospital Dashboard
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    onClick={() => setCurrentView('policeDashboard')}
                  >
                    Police Dashboard
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}

        </Box>
      </Box>
    );
  };

  // Determine if we're showing a dashboard or the login/signup form
  const isDashboardView = !['login', 'signup'].includes(currentView);

  return (
    <Container
      component="main"
      maxWidth={isDashboardView ? "xl" : "xs"}
      disableGutters={isDashboardView}
      sx={{
        width: '100%',
        height: '100vh',
        padding: isDashboardView ? 0 : undefined,
      }}
    >
      <CssBaseline />
      {renderDashboard()}

      {/* Logout button for dashboards */}
      {isDashboardView && (
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default LoginPage;