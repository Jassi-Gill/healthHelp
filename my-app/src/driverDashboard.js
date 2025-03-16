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
  TableBody,
  Modal,
  Paper
} from '@mui/material';
import {
  Notifications as BellIcon,
  Person as UserIcon,
  Phone as PhoneIcon,
  AccessTime as ClockIcon,
  LocationOn as MapPinIcon,
  History as HistoryIcon,
  LocalHospital as HospitalIcon,
  CalendarToday as CalendarIcon,
  Settings as SettingsIcon,
  Directions as NavigationIcon,
  ReportProblem as AlertCircleIcon
} from '@mui/icons-material';

const DriverDashboard = () => {
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);

  // Sample data - would come from your backend
  const activeEmergencies = [
    { id: 1, location: "123 Main St", eta: "5 mins" },
    { id: 2, location: "456 Oak Ave", eta: "8 mins" }
  ];

  const emergencyHistory = [
    {
      id: 1,
      date: '2025-02-08',
      type: 'Medical Emergency',
      response: 'Uber Driver',
      status: 'Completed',
      duration: '15 mins'
    },
    {
      id: 2,
      date: '2025-02-01',
      type: 'Accident',
      response: 'Ambulance',
      status: 'Completed',
      duration: '12 mins'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Top Navigation */}
      <AppBar position="static">
        <Toolbar>
          <HospitalIcon sx={{ mr: 2, color: 'red' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Driver Dashboard
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
        {/* Emergency Button */}
        <Box mb={8}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            size="large"
            startIcon={<PhoneIcon />}
            onClick={() => setShowEmergencyForm(true)}
          >
            Call Emergency Ambulance
          </Button>
        </Box>

        {/* Emergency Form Modal */}
        <Modal
          open={showEmergencyForm}
          onClose={() => setShowEmergencyForm(false)}
          aria-labelledby="emergency-form-title"
          aria-describedby="emergency-form-description"
        >
          <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 10 }}>
            <Typography id="emergency-form-title" variant="h6" component="h2">
              Request Emergency Service
            </Typography>
            <Box mt={2}>
              <Box display="flex" alignItems="center" mb={2}>
                <MapPinIcon sx={{ mr: 2, color: 'grey.500' }} />
                <Typography>Current Location: 123 Emergency St</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    onClick={() => setShowEmergencyForm(false)}
                  >
                    Critical Emergency
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    onClick={() => setShowEmergencyForm(false)}
                  >
                    Non-Critical Emergency
                  </Button>
                </Grid>
              </Grid>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setShowEmergencyForm(false)}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        </Modal>

        {/* Dashboard Grid */}
        <Grid container spacing={4}>
          {/* Active Emergencies */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardHeader
                title={
                  <Typography variant="h6" component="div" className="flex items-center">
                    <AlertCircleIcon sx={{ mr: 2, color: 'red' }} />
                    Active Emergencies
                  </Typography>
                }
              />
              <CardContent>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Location</TableCell>
                        <TableCell>ETA</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeEmergencies.map((emergency) => (
                        <TableRow key={emergency.id}>
                          <TableCell>{emergency.location}</TableCell>
                          <TableCell>{emergency.eta}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="primary"
                              startIcon={<NavigationIcon />}
                              sx={{ mt: 1 }}
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

          {/* Quick Stats */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                title="Emergency Response Time"
              />
              <CardContent>
                <Typography variant="h3" color="success.main">
                  &lt; 5 mins
                </Typography>
                <Typography color="textSecondary">
                  Average response time in your area
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                title="Available Services"
              />
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Ambulances Nearby</Typography>
                  <Typography variant="h6" color="success.main">4</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Uber/Ola Partners</Typography>
                  <Typography variant="h6" color="success.main">12</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader
                title="Medical Profile"
              />
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <UserIcon sx={{ mr: 2, color: 'grey.500' }} />
                  <Typography>Blood Type: O+</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <CalendarIcon sx={{ mr: 2, color: 'grey.500' }} />
                  <Typography>Last Emergency: 7 days ago</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Emergency History */}
        <Card sx={{ mt: 6 }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center">
                <HistoryIcon sx={{ mr: 2 }} />
                Emergency History
              </Box>
            }
          />
          <CardContent>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Response</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emergencyHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{history.date}</TableCell>
                      <TableCell>{history.type}</TableCell>
                      <TableCell>{history.response}</TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 'success.light',
                            color: 'success.dark',
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {history.status}
                        </Box>
                      </TableCell>
                      <TableCell>{history.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default DriverDashboard;