import React, { useState, useEffect } from 'react';
import { LoadScript, Autocomplete } from '@react-google-maps/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const libraries = ['places'];

const CreateTrip = () => {
    const [startInput, setStartInput] = useState('');
    const [endInput, setEndInput] = useState('');
    const [startPlace, setStartPlace] = useState(null);
    const [endPlace, setEndPlace] = useState(null);
    const [tripName, setTripName] = useState('');
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const navigate = useNavigate();

    // Fetch current location when "Use Current Location" is checked
    useEffect(() => {
        if (useCurrentLocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        formatted_address: 'Current Location',
                    };
                    setCurrentLocation(userLocation);
                    setStartPlace(userLocation);
                    setStartInput('Current Location');
                },
                error => {
                    console.error('Geolocation error:', error);
                    alert('Unable to fetch your location. Please allow location access.');
                    setUseCurrentLocation(false);
                },
                { enableHighAccuracy: true }
            );
        }
    }, [useCurrentLocation]);

    const handleStartSelect = (place) => {
        if (place.geometry) {
            setStartPlace(place);
            setStartInput(place.formatted_address);
        }
    };

    const handleEndSelect = (place) => {
        if (place.geometry) {
            setEndPlace(place);
            setEndInput(place.formatted_address);
        }
    };

    const createTrip = () => {
        if (startPlace && endPlace && tripName) {
            const tripData = {
                name: tripName,
                start_location: {
                    name: startPlace.formatted_address,
                    latitude: startPlace.geometry ? startPlace.geometry.location.lat() : startPlace.lat,
                    longitude: startPlace.geometry ? startPlace.geometry.location.lng() : startPlace.lng,
                },
                end_location: {
                    name: endPlace.formatted_address,
                    latitude: endPlace.geometry.location.lat(),
                    longitude: endPlace.geometry.location.lng(),
                },
            };

            axios.post('http://localhost:8000/api/trips/', tripData)
                .then(() => {
                    alert('Trip created successfully!');
                    navigate('/');
                })
                .catch(error => console.error('Error creating trip:', error));
        } else {
            alert('Please fill in all fields.');
        }
    };

    return (
        <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
            <div>
                <h2>Create New Trip</h2>
                <input
                    type="text"
                    placeholder="Trip Name"
                    value={tripName}
                    onChange={(e) => setTripName(e.target.value)}
                    style={{ display: 'block', marginBottom: '10px', width: '300px' }}
                />
                <div style={{ marginBottom: '10px' }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={useCurrentLocation}
                            onChange={(e) => setUseCurrentLocation(e.target.checked)}
                        />
                        Use My Current Location as Start
                    </label>
                </div>
                {!useCurrentLocation && (
                    <Autocomplete
                        onLoad={(autocomplete) => {
                            autocomplete.addListener('place_changed', () => {
                                const place = autocomplete.getPlace();
                                handleStartSelect(place);
                            });
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Start Location"
                            value={startInput}
                            onChange={(e) => setStartInput(e.target.value)}
                            style={{ display: 'block', marginBottom: '10px', width: '300px' }}
                        />
                    </Autocomplete>
                )}
                {useCurrentLocation && (
                    <input
                        type="text"
                        value={startInput}
                        readOnly
                        style={{ display: 'block', marginBottom: '10px', width: '300px' }}
                    />
                )}
                <Autocomplete
                    onLoad={(autocomplete) => {
                        autocomplete.addListener('place_changed', () => {
                            const place = autocomplete.getPlace();
                            handleEndSelect(place);
                        });
                    }}
                >
                    <input
                        type="text"
                        placeholder="End Location"
                        value={endInput}
                        onChange={(e) => setEndInput(e.target.value)}
                        style={{ display: 'block', marginBottom: '10px', width: '300px' }}
                    />
                </Autocomplete>
                <button onClick={createTrip}>Create Trip</button>
            </div>
        </LoadScript>
    );
};

export default CreateTrip;