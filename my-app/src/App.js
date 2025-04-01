import React from 'react';
import { LoadScript } from '@react-google-maps/api';
import PatientDashboard from './patientDashboard';
import PoliceDashboard from './policeDashboard';
import LoginPage from './LoginPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const libraries = ['places'];

function App() {
  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <LoginPage />
    </LoadScript>
  );
}

export default App;