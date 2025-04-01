import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Navigation as NavigationIcon,
  ReportProblem as AlertCircleIcon,
  Notifications as BellIcon,
  Person as UserIcon,
  Phone as PhoneIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';
import MapDetails from './mapdetails'; // Ensure this component is available

const DriverDashboard = () => {
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Fetch driver's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError(error.message);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Fetch emergencies from API
  useEffect(() => {
    const fetchEmergencies = () => {
      axios
        .get('http://localhost:8000/api/emergency-requests/', {
          params: { status: 'created,in_progress' }, // Filter for active emergencies
        })
        .then((response) => {
          // Transform data to match expected structure
          const transformedEmergencies = response.data.map((emergency) => ({
            id: emergency.id,
            start_location: {
              lat: emergency.start_location_latitude,
              lng: emergency.start_location_longitude,
              name: emergency.start_location_name,
            },
            end_location: {
              lat: emergency.end_location_latitude,
              lng: emergency.end_location_longitude,
              name: emergency.end_location_name,
            },
            type: emergency.emergency_type,
            status: emergency.status,
            eta: emergency.eta || 'N/A', // Placeholder for ETA
          }));
          setActiveEmergencies(transformedEmergencies);
        })
        .catch((error) => {
          console.error('Error fetching active emergencies:', error);
        });
    };

    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 10000); // Poll every 10 seconds
    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  // Handle viewing the route for a selected trip
  const handleViewRoute = (trip) => {
    setSelectedTrip(trip);
    setShowMap(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Top Navigation */}
      <AppBar position="static" sx={{ bgcolor: 'primary.dark' }}>
        <Toolbar>
          <HospitalIcon sx={{ mr: 2, color: 'red' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Driver Dashboard
          </Typography>
          <IconButton color="inherit">
            <BellIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <UserIcon />
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ py: 6 }}>
        {/* Location Error Message */}
        {locationError && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            Unable to access location: {locationError}. Please allow location access to view routes.
          </Typography>
        )}

        {/* Emergency Button
        <Box mb={4}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            size="large"
            startIcon={<PhoneIcon />}
            sx={{ py: 2, fontSize: '1.1rem', borderRadius: 2 }}
          >
            Call Emergency Ambulance
          </Button>
        </Box> */}

        {/* Active Emergencies Section */}
        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <AlertCircleIcon sx={{ mr: 2, color: 'red' }} />
                Active Emergencies
              </Typography>
            }
          />
          <CardContent>
            {activeEmergencies.length > 0 ? (
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
                        <TableCell>{emergency.start_location.name}</TableCell>
                        <TableCell>{emergency.type}</TableCell>
                        <TableCell>{emergency.eta}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<NavigationIcon />}
                            onClick={() => handleViewRoute(emergency)}
                            disabled={!driverLocation}
                            sx={{ borderRadius: 1 }}
                          >
                            View Route
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center' }}>
                No active emergencies at the moment
              </Typography>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Map Modal */}
      <Modal open={showMap} onClose={() => setShowMap(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {driverLocation && selectedTrip ? (
            <MapDetails
              start={driverLocation} // Driver's current location
              end={selectedTrip.end_location} // Trip's end location as final destination
              waypoints={[selectedTrip.start_location]} // Trip's start location as a stop
              onClose={() => setShowMap(false)}
            />
          ) : (
            <Typography>Unable to display map. Location data is missing.</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default DriverDashboard;