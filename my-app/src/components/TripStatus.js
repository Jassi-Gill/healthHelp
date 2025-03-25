import React, { useState, useEffect } from 'react';
import { LoadScript, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const libraries = ['places'];

const TripStatus = () => {
    const { id } = useParams(); // Get trip ID from URL
    const [trip, setTrip] = useState(null);
    const [directions, setDirections] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null); // User’s live location
    const [mapCenter] = useState({ lat: 12.931423492103944, lng: 77.61648476788898 }); // Default center

    // Fetch trip details and directions on mount
    useEffect(() => {
        axios.get(`http://localhost:8000/api/trips/${id}/`)
            .then(response => {
                setTrip(response.data);
                const directionsService = new window.google.maps.DirectionsService();
                directionsService.route(
                    {
                        origin: { lat: response.data.start_location.latitude, lng: response.data.start_location.longitude },
                        destination: { lat: response.data.end_location.latitude, lng: response.data.end_location.longitude },
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
            })
            .catch(error => console.error('Error fetching trip:', error));
    }, [id]);

    // Poll backend for live user location every 5 seconds
    useEffect(() => {
        const fetchLiveLocation = () => {
            axios.get(`http://localhost:8000/api/trip-status/?trip=${id}`)
                .then(response => {
                    if (response.data.length > 0) {
                        const latestStatus = response.data[0]; // Assume latest status is first
                        setCurrentLocation({
                            lat: latestStatus.current_latitude,
                            lng: latestStatus.current_longitude,
                        });
                    }
                })
                .catch(error => console.error('Error fetching live trip status:', error));
        };

        // Fetch immediately on mount
        fetchLiveLocation();

        // Set up polling every 5 seconds
        const intervalId = setInterval(fetchLiveLocation, 5000);

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [id]);

    if (!trip) return <p>Loading trip data...</p>;

    return (
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
            <div>
                <h2>{trip.name}</h2>
                <p>Start: {trip.start_location.name}</p>
                <p>End: {trip.end_location.name}</p>
                {currentLocation && (
                    <p>Current Location: Lat {currentLocation.lat.toFixed(4)}, Lng {currentLocation.lng.toFixed(4)}</p>
                )}
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '400px' }}
                    center={currentLocation || { lat: trip.start_location.latitude, lng: trip.start_location.longitude }} // Center on current location if available, else start
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
                    {/* Current Location Marker (if available) */}
                    {currentLocation && (
                        <Marker
                            position={currentLocation}
                            label="Traveler"
                            icon={{
                                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png', // Blue marker for current position
                            }}
                        />
                    )}
                    {/* Directions Route */}
                    {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
                <h3>Share This Trip</h3>
                <p>Share this link to monitor the trip status:</p>
                <a href={`${window.location.origin}/trip/${id}`}>
                    {`${window.location.origin}/trip/${id}`}
                </a>
            </div>
        </LoadScript>
    );
};

export default TripStatus;