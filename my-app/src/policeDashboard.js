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
  TableBody,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Notifications as BellIcon,
  Person as UserIcon,
  Directions as NavigationIcon,
  Shield as ShieldIcon,
  BarChart as BarChartIcon,
  ReportProblem as AlertCircleIcon,
  Map as MapIcon,
  AccessTime as ClockIcon,
  LocalPolice as PoliceIcon,
} from '@mui/icons-material';
import axios from 'axios';
import MapDetails from './mapdetails';

const PoliceDashboard = () => {
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [navigatingEmergency, setNavigatingEmergency] = useState(null);
  const [onDuty, setOnDuty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  useEffect(() => {
    // Fetch driver status
    const fetchPoliceStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/police/status/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        setOnDuty(response.data.driver_active);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching driver status:', error);
        setLoading(false);
      }
    };

    fetchPoliceStatus();

  }, []);

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
  const handleDutyToggle = async () => {
    try {
      setLoading(true);
      const newStatus = !onDuty;

      const response = await axios.patch(
        'http://localhost:8000/api/police/status/',
        { driver_active: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setOnDuty(newStatus);
      setSnackbar({
        open: true,
        message: `You are now ${newStatus ? 'on duty' : 'off duty'}`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating duty status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update status. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PoliceIcon sx={{ mr: 2, color: onDuty ? 'success.main' : 'text.secondary' }} />
            <Typography variant="h6">
              Police Status: <Typography component="span" color={onDuty ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 'bold' }}>
                {onDuty ? 'On Duty' : 'Off Duty'}
              </Typography>
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={onDuty}
                onChange={handleDutyToggle}
                color="success"
                disabled={loading}
              />
            }
            label={loading ? "Updating..." : ""}
          />
        </CardContent>
      </Card>

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