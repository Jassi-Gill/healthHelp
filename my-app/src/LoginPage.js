import React, { useState } from 'react';
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
  CssBaseline
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HospitalDashboard from './hospitalDashboard';
import PatientDashboard from './patientDashboard';
import DriverDashboard from './driverDashboard';
import PoliceDashboard from './policeDashboard';

const LoginPage = () => {
  const [userType, setUserType] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('login'); // 'login', 'patientDashboard', 'hospitalDashboard', etc.

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically integrate with your Django backend
    setError(''); // Clear any previous errors
    console.log('Login attempt:', { userType, email, password });
  };

  const handleDashboardAccess = (dashboardType) => {
    setCurrentView(dashboardType);
  };

  const renderDashboard = () => {
    switch (currentView) {
      case 'patientDashboard':
        return <PatientDashboard goBack={() => setCurrentView('login')} />;
      case 'driverDashboard':
        return <DriverDashboard goBack={() => setCurrentView('login')} />;
      case 'hospitalDashboard':
        return <HospitalDashboard goBack={() => setCurrentView('login')} />;
      case 'policeDashboard':
        return <PoliceDashboard goBack={() => setCurrentView('login')} />;
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
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={userType === 'patient' ? 'contained' : 'outlined'}
                onClick={() => setUserType('patient')}
              >
                Patient
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={userType === 'driver' ? 'contained' : 'outlined'}
                onClick={() => setUserType('driver')}
              >
                Driver
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={userType === 'hospital' ? 'contained' : 'outlined'}
                onClick={() => setUserType('hospital')}
              >
                Hospital
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant={userType === 'police' ? 'contained' : 'outlined'}
                onClick={() => setUserType('police')}
              >
                Police
              </Button>
            </Grid>
          </Grid>
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
          >
            Login as {userType.charAt(0).toUpperCase() + userType.slice(1)}
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Grid>
            <Grid item>
              <Link href="#" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
          
          {/* Quick Access Dashboard Buttons */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" align="center" gutterBottom>
              Quick Dashboard Access (No Authentication)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handleDashboardAccess('patientDashboard')}
                >
                  Patient Dashboard
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handleDashboardAccess('driverDashboard')}
                >
                  Driver Dashboard
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handleDashboardAccess('hospitalDashboard')}
                >
                  Hospital Dashboard
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={() => handleDashboardAccess('policeDashboard')}
                >
                  Police Dashboard
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    );
  };

  // Determine if we're showing a dashboard or the login form
  const isDashboardView = currentView !== 'login';

  return (
    <Container 
      component="main" 
      maxWidth={isDashboardView ? "xl" : "xs"} // Use full width for dashboards
      disableGutters={isDashboardView} // Remove padding for dashboards
      sx={{
        width: '100%',
        height: '100vh',
        padding: isDashboardView ? 0 : undefined,
      }}
    >
      <CssBaseline />
      {renderDashboard()}
      
      {/* Back button for dashboards */}
      {isDashboardView && (
        <Box sx={{ position: 'absolute', top: 16, left: 16 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setCurrentView('login')}
          >
            Back to Login
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default LoginPage;