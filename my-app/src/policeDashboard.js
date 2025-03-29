import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  Grid,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import {
  Notifications as BellIcon,
  Person as UserIcon,
  Directions as NavigationIcon,
  Shield as ShieldIcon,
  BarChart as BarChartIcon,
  ReportProblem as AlertCircleIcon,
  Map as MapIcon,
  AccessTime as ClockIcon
} from '@mui/icons-material';
import axios from 'axios';
import MapDetails from './mapdetails';

const PoliceDashboard = () => {
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [navigatingEmergency, setNavigatingEmergency] = useState(null);

  useEffect(() => {
    const fetchEmergencies = () => {
      axios
        .get('http://localhost:8000/api/emergency-requests/', {
          params: { status: 'created,in_progress' } // Filter for active emergencies
        })
        .then(response => {
          // Transform data to match expected structure
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
            eta: emergency.eta || 'N/A' // ETA not in model; placeholder for future use
          }));
          setActiveEmergencies(transformedEmergencies);
        })
        .catch(error => {
          console.error('Error fetching active emergencies:', error);
        });
    };
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (emergency) => {
    setNavigatingEmergency(emergency);
  };

  const handleCloseMap = () => {
    setNavigatingEmergency(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Top Navigation */}
      <AppBar position="static">
        <Toolbar>
          <ShieldIcon sx={{ mr: 2, color: 'blue' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Police Dashboard
          </Typography>
          <IconButton color="inherit">
            <BellIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: 'grey.300' }}>
            <UserIcon />
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ py: 6 }}>
        {navigatingEmergency ? (
          <MapDetails emergency={navigatingEmergency} onClose={handleCloseMap} />
        ) : (
          <>
            {/* Emergency Status Overview */}
            <Grid container spacing={4} mb={6}>
              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="textSecondary">Active Emergencies</Typography>
                        <Typography variant="h4" color="error">{activeEmergencies.length}</Typography>
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
                        <Typography variant="body2" color="textSecondary">Available Officers</Typography>
                        <Typography variant="h4" color="success">8</Typography>
                      </Box>
                      <ShieldIcon color="success" fontSize="large" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="textSecondary">Patrol Vehicles</Typography>
                        <Typography variant="h4" color="primary">15</Typography>
                      </Box>
                      <MapIcon color="primary" fontSize="large" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="textSecondary">Avg Response Time</Typography>
                        <Typography variant="h4" color="secondary">4.2m</Typography>
                      </Box>
                      <ClockIcon color="secondary" fontSize="large" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Main Grid */}
            <Grid container spacing={6}>
              {/* Live Emergency Requests */}
              <Grid item xs={12} lg={8}>
                <Card>
                  <CardHeader
                    title={
                      <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
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
                                  sx={{ mt: 1 }}
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
              </Grid>
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default PoliceDashboard;