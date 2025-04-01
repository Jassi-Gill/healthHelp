import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { Box, Button, Typography } from '@mui/material';

const MapDetails = ({ emergency, start, end, onClose }) => {
  const [directions, setDirections] = useState(null);

  useEffect(() => {
    let origin, destination;
    if (start && end) {
      origin = { lat: start.lat, lng: start.lng };
      destination = { lat: end.lat, lng: end.lng };
    } else if (emergency && emergency.start_location && emergency.end_location) {
      origin = { lat: emergency.start_location.lat, lng: emergency.start_location.lng };
      destination = { lat: emergency.end_location.lat, lng: emergency.end_location.lng };
    } else {
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
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
  }, [emergency, start, end]);

  if (!start && !end && (!emergency || !emergency.start_location || !emergency.end_location)) {
    return (
      <Box sx={{ p: 2 }}>
        <Button variant="outlined" onClick={onClose} sx={{ mb: 2 }}>
          Close
        </Button>
        <Typography>No valid location data available.</Typography>
      </Box>
    );
  }

  const mapCenter = start || (emergency && emergency.start_location) || { lat: 0, lng: 0 };

  return (
    <Box sx={{ p: 2 }}>
      <Button variant="outlined" onClick={onClose} sx={{ mb: 2 }}>
        Close
      </Button>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '500px' }}
        center={{ lat: mapCenter.lat, lng: mapCenter.lng }}
        zoom={13}
      >
        {start && <Marker position={{ lat: start.lat, lng: start.lng }} label="Driver" />}
        {end && <Marker position={{ lat: end.lat, lng: end.lng }} label="Pickup" />}
        {emergency && emergency.start_location && (
          <Marker position={{ lat: emergency.start_location.lat, lng: emergency.start_location.lng }} label="Start" />
        )}
        {emergency && emergency.end_location && (
          <Marker position={{ lat: emergency.end_location.lat, lng: emergency.end_location.lng }} label="Destination" />
        )}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </Box>
  );
};

export default MapDetails;