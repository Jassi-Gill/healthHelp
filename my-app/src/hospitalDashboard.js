import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Toolbar,
  Typography
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Notifications as BellIcon,
  Person as UserIcon,
  ReportProblem as AlertCircleIcon,
  People as UsersIcon,
  AccessTime as ClockIcon,
  LocationOn as MapPinIcon,
  BarChart as BarChartIcon,
  Phone as PhoneIcon,
  Directions as NavigationIcon
} from '@mui/icons-material';
import axios from 'axios';
import MapDetails from './mapdetails';
import ViewAllResources from './ViewAllResources';

const HospitalDashboard = () => {
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [navigatingEmergency, setNavigatingEmergency] = useState(null);
  const [showResources, setShowResources] = useState(false);

  useEffect(() => {
    const fetchEmergencies = () => {
      axios
        .get('http://localhost:8000/api/emergency-requests/', {
          params: { status: 'created,in_progress' }
        })
        .then(response => {
          const transformedEmergencies = response.data.map(emergency => ({
            id: emergency.id,
            start_location: {
              lat: emergency.start_location_latitude,
              lng: emergency.start_location_longitude,
              name: emergency.start_location_name
            },
            end_location: {
              lat: emergency.end_location_latitude,
              lng: emergency.end_location_longitude,
              name: emergency.end_location_name
            },
            type: emergency.emergency_type,
            status: emergency.status,
            eta: emergency.eta || 'N/A'
          }));
          setActiveEmergencies(transformedEmergencies);
        })
        .catch(error => {
          console.error('Error fetching active emergencies:', error);
        });
    };

    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (emergency) => {
    setNavigatingEmergency(emergency);
  };

  const handleCloseMap = () => {
    setNavigatingEmergency(null);
  };

  // Updated navigation to View All Resources page 
  const goToViewAllResources = () => {
    setShowResources(true);
  };

  // Function to return to dashboard from resources view
  const goBackToDashboard = () => {
    setShowResources(false);
  };

  // If viewing resources, render the resources component instead of dashboard
  if (showResources) {
    return <ViewAllResources onGoBack={goBackToDashboard} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="static">
        <Toolbar>
          <HospitalIcon sx={{ mr: 2, color: 'red' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hospital Dashboard
          </Typography>
          <IconButton color="inherit">
            <BellIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: 'grey.300' }}>
            <UserIcon />
          </Avatar>
        </Toolbar>
      </AppBar>

      {navigatingEmergency ? (
        <MapDetails emergency={navigatingEmergency} onClose={handleCloseMap} />
      ) : (
        <Container sx={{ py: 4 }}>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Active Emergencies
                      </Typography>
                      <Typography variant="h4" color="error">
                        {activeEmergencies.length}
                      </Typography>
                    </Box>
                    <AlertCircleIcon color="error" fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Available Ambulances
                      </Typography>
                      <Typography variant="h4" color="success">
                        8
                      </Typography>
                    </Box>
                    <HospitalIcon color="success" fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Uber/Ola Partners
                      </Typography>
                      <Typography variant="h4" color="primary">
                        15
                      </Typography>
                    </Box>
                    <UsersIcon color="primary" fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Avg Response Time
                      </Typography>
                      <Typography variant="h4" color="secondary">
                        4.2m
                      </Typography>
                    </Box>
                    <ClockIcon color="secondary" fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={6}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardHeader
                  title={
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <AlertCircleIcon sx={{ mr: 2, color: 'red' }} />
                      Live Emergency Requests
                    </Typography>
                  }
                />
                <CardContent>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Location</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activeEmergencies.map((emergency) => (
                          <TableRow key={emergency.id}>
                            <TableCell>{emergency.start_location.name}</TableCell>
                            <TableCell>{emergency.type}</TableCell>
                            <TableCell>{emergency.status}</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                startIcon={<NavigationIcon />}
                                onClick={() => handleNavigate(emergency)}
                              >
                                Navigate
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ mt: 6 }}>
                <CardHeader
                  title={
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <BarChartIcon sx={{ mr: 2 }} />
                      Response Time Analytics
                    </Typography>
                  }
                />
                <CardContent>
                  <Box
                    sx={{ height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}
                  >
                    Response time chart will be displayed here
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card sx={{ mb: 4 }}>
                <CardHeader title="Quick Actions" />
                <CardContent>
                  <Button variant="contained" color="error" fullWidth startIcon={<PhoneIcon />} sx={{ mb: 2 }}>
                    Dispatch Ambulance
                  </Button>
                  <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }}>
                    Contact Traffic Police
                  </Button>
                  <Button variant="contained" fullWidth onClick={goToViewAllResources}>
                    View All Resources
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Available Resources" />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                      <HospitalIcon sx={{ mr: 2, color: 'green' }} />
                      <Typography>Emergency Ambulances</Typography>
                    </Box>
                    <Typography variant="h6" color="green">8</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                      <UsersIcon sx={{ mr: 2, color: 'blue' }} />
                      <Typography>Uber/Ola Partners</Typography>
                    </Box>
                    <Typography variant="h6" color="blue">15</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <MapPinIcon sx={{ mr: 2, color: 'purple' }} />
                      <Typography>Coverage Area</Typography>
                    </Box>
                    <Typography variant="h6" color="purple">5 km</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}
    </Box>
  );
};

export default HospitalDashboard;