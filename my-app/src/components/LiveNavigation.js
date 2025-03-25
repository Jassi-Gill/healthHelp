import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import Navigation from './Navigation';
import { haversineDistance } from '../utils';
import axios from 'axios';

const LiveNavigation = ({ trip, instructions, directions, tripStatus }) => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Watch for real-time location updates
        const watchId = navigator.geolocation.watchPosition(
            position => {
                const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
                setCurrentLocation(userLocation);

                // Update trip status in backend
                axios.post('http://localhost:8000/api/trip-status/', {
                    trip: trip.id,
                    current_latitude: userLocation.lat,
                    current_longitude: userLocation.lng,
                }).catch(error => console.error('Error updating trip status:', error));

                // Find the closest step in the navigation instructions
                const closestStepIndex = instructions.reduce((closest, step, index) => {
                    const distance = haversineDistance(userLocation, step.location);
                    return distance < closest.distance ? { index, distance } : closest;
                }, { index: 0, distance: Infinity }).index;
                setCurrentStep(closestStepIndex);
            },
            error => {
                console.error('Geolocation error:', error);
                alert('Unable to fetch location. Please ensure location permissions are enabled.');
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );

        // Cleanup the watch on component unmount
        return () => navigator.geolocation.clearWatch(watchId);
    }, [trip, instructions]);

    return (
        <div>
            <h2>Live Navigation</h2>
            {currentLocation ? (
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '500px' }}
                    center={currentLocation} // Center on current location
                    zoom={15}
                >
                    {/* Start Location Marker */}
                    <Marker
                        position={{ lat: trip.start_location.latitude, lng: trip.start_location.longitude }}
                        label="Start"
                        icon={{
                            url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png', // Green marker for start
                        }}
                    />
                    {/* End Location Marker */}
                    <Marker
                        position={{ lat: trip.end_location.latitude, lng: trip.end_location.longitude }}
                        label="End"
                        icon={{
                            url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', // Red marker for end
                        }}
                    />
                    {/* Current Location Marker */}
                    <Marker
                        position={currentLocation}
                        label="You"
                        icon={{
                            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Blue marker for current position
                        }}
                    />
                    {/* Directions Route */}
                    {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
            ) : (
                <p>Loading your location...</p>
            )}
            <Navigation instructions={instructions} currentStep={currentStep} />
        </div>
    );
};

export default LiveNavigation;