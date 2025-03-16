import React, { useState } from 'react';
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

// Import the MapDetails component
import MapDetails from './mapdetails';

const PoliceDashboard = () => {
  // State to manage which emergency is being navigated
  const [navigatingEmergency, setNavigatingEmergency] = useState(null);

  // Sample data - would come from your backend
  const activeEmergencies = [
    { id: 1, location: "123 Main St", type: "Robbery", eta: "5 mins" },
    { id: 2, location: "456 Oak Ave", type: "Accident", eta: "8 mins" }
  ];

  // Function to handle navigation button click
  const handleNavigate = (emergency) => {
    setNavigatingEmergency(emergency);
  };

  // Function to close map details
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
        {/* Show MapDetails if navigating, otherwise show normal dashboard */}
        {navigatingEmergency ? (
          <MapDetails 
            emergency={navigatingEmergency} 
            onClose={handleCloseMap} 
          />
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
                        <Typography variant="h4" color="error">4</Typography>
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
                      <Typography variant="h6" component="div" className="flex items-center">
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
                            <TableCell>ETA</TableCell>
                            <TableCell>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {activeEmergencies.map((emergency) => (
                            <TableRow key={emergency.id}>
                              <TableCell>{emergency.location}</TableCell>
                              <TableCell>{emergency.type}</TableCell>
                              <TableCell>{emergency.eta}</TableCell>
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

                {/* Response Time Chart */}
                <Card sx={{ mt: 6 }}>
                  <CardHeader
                    title={
                      <Typography variant="h6" component="div" className="flex items-center">
                        <BarChartIcon sx={{ mr: 2 }} />
                        Response Time Analytics
                      </Typography>
                    }
                  />
                  <CardContent>
                    <Box sx={{ height: 256, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                      Response time chart will be displayed here
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Sidebar */}
              <Grid item xs={12} lg={4}>
                {/* Quick Actions */}
                <Card>
                  <CardHeader title="Quick Actions" />
                  <CardContent>
                    <Button variant="contained" color="error" fullWidth startIcon={<NavigationIcon />}>
                      Dispatch Officer
                    </Button>
                    <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                      Contact Traffic Police
                    </Button>
                    <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                      View All Resources
                    </Button>
                  </CardContent>
                </Card>

                {/* Available Resources */}
                <Card sx={{ mt: 6 }}>
                  <CardHeader title="Available Resources" />
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center">
                        <ShieldIcon sx={{ mr: 2, color: 'green' }} />
                        <Typography>Emergency Officers</Typography>
                      </Box>
                      <Typography variant="h6" color="green">8</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Box display="flex" alignItems="center">
                        <MapIcon sx={{ mr: 2, color: 'blue' }} />
                        <Typography>Patrol Vehicles</Typography>
                      </Box>
                      <Typography variant="h6" color="blue">15</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center">
                        <ClockIcon sx={{ mr: 2, color: 'purple' }} />
                        <Typography>Coverage Area</Typography>
                      </Box>
                      <Typography variant="h6" color="purple">5 km</Typography>
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