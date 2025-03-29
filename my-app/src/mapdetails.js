import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Box, Button, Typography } from '@mui/material';

const MapDetails = ({ emergency, onClose }) => {
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    if (emergency && emergency.start_location && emergency.end_location) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: emergency.start_location.lat, lng: emergency.start_location.lng },
          destination: { lat: emergency.end_location.lat, lng: emergency.end_location.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
          } else {
            console.error('Error fetching directions:', status);
          }
        }
      );
    }
  }, [emergency]);

  if (!emergency || !emergency.start_location || !emergency.end_location) {
    return (
      <Box sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ mb: 2 }}>
          Close
        </Button>
        <Typography>No valid emergency location data available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Button variant="outlined" onClick={onClose} sx={{ mb: 2 }}>
        Close
      </Button>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '500px' }}
        center={{ lat: emergency.start_location.lat, lng: emergency.start_location.lng }}
        zoom={13}
      >
        <Marker position={{ lat: emergency.start_location.lat, lng: emergency.start_location.lng }} label="Start" />
        <Marker position={{ lat: emergency.end_location.lat, lng: emergency.end_location.lng }} label="Destination" />
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </Box>
  );
};

export default MapDetails;