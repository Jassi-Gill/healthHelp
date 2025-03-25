import React from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';

const Map = ({ center, zoom, directions, currentLocation }) => {
    return (
        <GoogleMap
            mapContainerStyle={{ width: '100%', height: '500px' }}
            center={center}
            zoom={zoom}
        >
            {currentLocation && (
                <Marker
                    position={currentLocation}
                    label="You"
                    icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }}
                />
            )}
            {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
    );
};

export default Map;