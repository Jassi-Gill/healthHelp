import React from 'react';
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
  People as UsersIcon,
  AccessTime as ClockIcon,
  LocationOn as MapPinIcon,
  Notifications as BellIcon,
  CalendarToday as CalendarIcon,
  Person as UserIcon,
  Fullscreen as MaximizeIcon,
  BarChart as BarChartIcon,
  Phone as PhoneIcon,
  ReportProblem as AlertCircleIcon,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';

const HospitalDashboard = () => {
  // Sample data - would come from your backend
  const emergencyRequests = [
    { id: 1, patient: "John Doe", type: "Critical", eta: "5 mins", location: "123 Main St", responder: "Uber-A123" },
    { id: 2, patient: "Jane Smith", type: "Non-Critical", eta: "8 mins", location: "456 Oak Ave", responder: "Ambulance-B789" }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Top Navigation */}
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

      {/* Main Content */}
      <Container sx={{ py: 6 }}>
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
                    <Typography variant="body2" color="textSecondary">Available Ambulances</Typography>
                    <Typography variant="h4" color="success">8</Typography>
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
                    <Typography variant="body2" color="textSecondary">Uber/Ola Partners</Typography>
                    <Typography variant="h4" color="primary">15</Typography>
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
                        <TableCell>Patient</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>ETA</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Responder</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {emergencyRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.patient}</TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              component="span"
                              sx={{
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                bgcolor: request.type === 'Critical' ? 'error.light' : 'warning.light',
                                color: request.type === 'Critical' ? 'error.dark' : 'warning.dark'
                              }}
                            >
                              {request.type}
                            </Typography>
                          </TableCell>
                          <TableCell>{request.eta}</TableCell>
                          <TableCell>{request.location}</TableCell>
                          <TableCell>{request.responder}</TableCell>
                          <TableCell>
                            <Button variant="contained" size="small">View Details</Button>
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
                <Button variant="contained" color="error" fullWidth startIcon={<PhoneIcon />}>
                  Dispatch Ambulance
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
    </Box>
  );
};

export default HospitalDashboard;