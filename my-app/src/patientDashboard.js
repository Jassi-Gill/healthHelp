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
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { StandaloneSearchBox } from '@react-google-maps/api';
import axios from 'axios';
import EmergencyDetailsModal from './emergencyDetailsModal';
import EmergencyAmbulanceCalling from './emergencyAmbulanceCalling';

const PatientDashboard = ({ goBack }) => {
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showEmergencyDetails, setShowEmergencyDetails] = useState(false);
  const [showEmergencyCalling, setShowEmergencyCalling] = useState(false);
  const [startSearchBox, setStartSearchBox] = useState(null);
  const [destinationSearchBox, setDestinationSearchBox] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  const [emergencyRequest, setEmergencyRequest] = useState(null);
  useEffect(() => {
    if (showEmergencyForm) {
      const style = document.createElement('style');
      style.textContent = '.pac-container { z-index: 1400 !important; }';
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [showEmergencyForm]);

  // Sample emergency history data (replace with backend data)
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

  // Handle clicking an emergency history entry
  const handleEmergencyClick = (emergency) => {
    setSelectedEmergency(emergency);
    setShowEmergencyDetails(true);
  };

  // Load handlers for search boxes
  const onStartLoad = (ref) => setStartSearchBox(ref);
  const onDestinationLoad = (ref) => setDestinationSearchBox(ref);

  // Handle place selection for start location
  const onStartPlacesChanged = () => {
    if (startSearchBox) {
      const places = startSearchBox.getPlaces();
      if (places.length > 0) {
        const place = places[0];
        setStartLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          name: place.formatted_address
        });
      }
    }
  };

  // Handle place selection for destination
  const onDestinationPlacesChanged = () => {
    if (destinationSearchBox) {
      const places = destinationSearchBox.getPlaces();
      if (places.length > 0) {
        const place = places[0];
        setDestinationLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          name: place.formatted_address
        });
      }
    }
  };

  // Handle "Use Current Location" button
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoadingCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: position.coords.latitude, lng: position.coords.longitude } },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                setStartLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  name: results[0].formatted_address
                });
              } else {
                setStartLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  name: 'Current Location'
                });
              }
              setLoadingCurrentLocation(false);
            }
          );
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Unable to fetch current location. Please ensure location services are enabled.');
          setLoadingCurrentLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Handle emergency call request
  const handleEmergencyCallRequest = (type) => {
    if (!startLocation || !destinationLocation) {
      alert('Please select both start and destination locations.');
      return;
    }

    axios
      .post(
        'http://localhost:8000/api/emergency-requests/',
        {
          start_location_latitude: startLocation.lat,
          start_location_longitude: startLocation.lng,
          start_location_name: startLocation.name,
          end_location_latitude: destinationLocation.lat,
          end_location_longitude: destinationLocation.lng,
          end_location_name: destinationLocation.name,
          emergency_type: type,  // 'critical' or 'non-critical'
        }
      )
      .then((response) => {
        setShowEmergencyForm(false);
        setShowEmergencyCalling(true);
        setStartLocation(null);
        setDestinationLocation(null);
        setEmergencyRequest(response.data);
      })
      .catch((error) => {
        console.error('Error requesting emergency service:', error);
        if (error.response) {
          if (error.response.status === 401) {
            alert('Unauthorized request. Please log in if required.');
          } else if (error.response.status === 400) {
            alert('Invalid request data: ' + JSON.stringify(error.response.data));
          } else {
            alert('Failed to request emergency service. Please try again.');
          }
        } else {
          alert('Network error. Please check your connection.');
        }
      });
  };

  // Close emergency calling dialog
  const handleCloseEmergencyCalling = () => {
    setShowEmergencyCalling(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Top Navigation */}
      <AppBar position="static">
        <Toolbar>
          <HospitalIcon sx={{ mr: 2, color: 'red' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Emergency Response System
          </Typography>
          {goBack && (
            <Button color="inherit" onClick={goBack}>
              Back to Login
            </Button>
          )}
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
          <Paper sx={{
            p: 4,
            maxWidth: 600,
            mx: 'auto',
            mt: 10,
            position: 'relative',
            zIndex: 1301 // Ensure modal content is above backdrop
          }}>
            <Typography id="emergency-form-title" variant="h6" component="h2">
              Request Emergency Service
            </Typography>
            <Box mt={2}>
              <Typography variant="subtitle1">Start Location</Typography>
              <Box display="flex" alignItems="center">
                <StandaloneSearchBox onLoad={onStartLoad} onPlacesChanged={onStartPlacesChanged}>
                  <input
                    type="text"
                    placeholder="Enter start location"
                    style={{
                      width: '100%',
                      padding: '10px',
                      boxSizing: 'border-box',
                      zIndex: 1400 // Ensure input is above other elements
                    }}
                  />
                </StandaloneSearchBox>
                <Button
                  variant="outlined"
                  onClick={handleUseCurrentLocation}
                  disabled={loadingCurrentLocation}
                  sx={{ ml: 2, whiteSpace: 'nowrap' }}
                >
                  {loadingCurrentLocation ? 'Loading...' : 'Use Current Location'}
                </Button>
              </Box>
              {startLocation && <Typography mt={1}>Selected: {startLocation.name}</Typography>}

              <Typography variant="subtitle1" sx={{ mt: 2 }}>Destination</Typography>
              <StandaloneSearchBox onLoad={onDestinationLoad} onPlacesChanged={onDestinationPlacesChanged}>
                <input
                  type="text"
                  placeholder="Enter destination"
                  style={{
                    width: '100%',
                    padding: '10px',
                    boxSizing: 'border-box',
                    zIndex: 1400 // Ensure input is above other elements
                  }}
                />
              </StandaloneSearchBox>
              {destinationLocation && <Typography mt={1}>Selected: {destinationLocation.name}</Typography>}

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    onClick={() => handleEmergencyCallRequest('critical')}
                    disabled={!startLocation || !destinationLocation}
                  >
                    Critical Emergency
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    onClick={() => handleEmergencyCallRequest('non-critical')}
                    disabled={!startLocation || !destinationLocation}
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
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Emergency Response Time" />
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
              <CardHeader title="Available Services" />
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
              <CardHeader title="Medical Profile" />
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
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'success.main', color: 'white' }
                          }}
                          onClick={() => handleEmergencyClick(history)}
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

      {/* Emergency Details Modal */}
      <EmergencyDetailsModal
        open={showEmergencyDetails}
        onClose={() => setShowEmergencyDetails(false)}
        emergency={selectedEmergency}
      />

      {/* Emergency Ambulance Calling Component */}
      {showEmergencyCalling && <EmergencyAmbulanceCalling onClose={handleCloseEmergencyCalling} emergencyRequest={emergencyRequest} />}
    </Box>
  );
};

export default PatientDashboard;