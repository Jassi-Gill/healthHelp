import React from 'react';

const TripSharing = ({ tripId }) => {
    const shareUrl = `${window.location.origin}/trip-status?trip_id=${tripId}`;

    return (
        <div>
            <h2>Share Your Trip</h2>
            <p>Share this link to view your live trip status:</p>
            <a href={shareUrl}>{shareUrl}</a>
        </div>
    );
};

export default TripSharing;