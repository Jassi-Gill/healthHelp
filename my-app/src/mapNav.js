import React, { useState, useEffect } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import { LoadScript, GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';
import CreateTrip from './components/CreateTrip';
import TripStatus from './components/TripStatus';
import LiveNavigation from './components/LiveNavigation'; // Import LiveNavigation

const libraries = ['places'];

const MapNav = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Trip Navigator</h1>
            <nav>
                <Link to="/" style={{ marginRight: '10px' }}>Home</Link>
                <Link to="/create-trip">Create Trip</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create-trip" element={<CreateTrip />} />
                <Route path="/trip/:id" element={<TripStatus />} />
            </Routes>
        </div>
    );
};

const Home = () => {
    const [trips, setTrips] = useState([]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [directions, setDirections] = useState(null);
    const [instructions, setInstructions] = useState([]); // Add state for instructions
    const [isNavigating, setIsNavigating] = useState(false);
    const [mapCenter] = useState({ lat: 12.931423492103944, lng: 77.61648476788898 });

    useEffect(() => {
        axios.get('http://localhost:8000/api/trips/')
            .then(response => setTrips(response.data))
            .catch(error => console.error('Error fetching trips:', error));
    }, []);

    const handleSelectTrip = (trip) => {
        setSelectedTrip(trip);
        setIsNavigating(false);
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
            {
                origin: { lat: trip.start_location.latitude, lng: trip.start_location.longitude },
                destination: { lat: trip.end_location.latitude, lng: trip.end_location.longitude },
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    // Extract instructions from the directions result
                    const steps = result.routes[0].legs[0].steps.map(step => ({
                        instruction: step.instructions,
                        location: { lat: step.start_location.lat(), lng: step.start_location.lng() },
                    }));
                    setInstructions(steps);
                } else {
                    console.error('Error fetching directions:', status);
                }
            }
        );
    };

    const startNavigation = (trip) => {
        handleSelectTrip(trip); // This will set directions and instructions
        setIsNavigating(true);
    };

    const shareTrip = (tripId) => {
        const shareUrl = `${window.location.origin}/trip/${tripId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Trip URL copied to clipboard: ' + shareUrl);
        });
    };

    return (
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
            <div>
                <h2>Your Trips</h2>
                <ul>
                    {trips.map(trip => (
                        <li key={trip.id}>
                            {trip.name}
                            <button onClick={() => handleSelectTrip(trip)} style={{ marginLeft: '10px' }}>
                                View Route
                            </button>
                            <button onClick={() => startNavigation(trip)} style={{ marginLeft: '10px' }}>
                                Start Navigation
                            </button>
                            <button onClick={() => shareTrip(trip.id)} style={{ marginLeft: '10px' }}>
                                Share Trip
                            </button>
                        </li>
                    ))}
                </ul>

                {/* Display the map when a trip is selected but not navigating */}
                {selectedTrip && !isNavigating && (
                    <div>
                        <h3>{selectedTrip.name}</h3>
                        <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '400px' }}
                            center={mapCenter}
                            zoom={15}
                        >
                            <Marker position={{ lat: selectedTrip.start_location.latitude, lng: selectedTrip.start_location.longitude }} />
                            <Marker position={{ lat: selectedTrip.end_location.latitude, lng: selectedTrip.end_location.longitude }} />
                            {directions && <DirectionsRenderer directions={directions} />}
                        </GoogleMap>
                    </div>
                )}

                {/* Render LiveNavigation when navigating */}
                {isNavigating && (
                    <LiveNavigation
                        trip={selectedTrip}
                        instructions={instructions} // Pass the extracted instructions
                        directions={directions}
                        tripStatus={null} // Assuming tripStatus isn’t used yet; adjust if needed
                    />
                )}
            </div>
        </LoadScript>
    );
};

export default MapNav;