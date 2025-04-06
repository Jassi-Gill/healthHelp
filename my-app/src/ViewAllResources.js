import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Typography,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Divider,
  Paper,
  Slider,
  Button
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ArrowBack as BackIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Healing as HealingIcon
} from '@mui/icons-material';

const ViewAllResources = ({ onGoBack }) => {
  const [resources, setResources] = useState({
    totalBeds: 0,
    availableBeds: 0,
    oxygenCylinders: 0,
    ventilators: 0,
    icuBeds: 0,
    totalPatients: 0,
    doctors: 0,
    nurses: 0,
    ambulances: 0,
    emergencyRooms: 0
  });

  useEffect(() => {
    const fetchResources = async () => {
      const token = localStorage.getItem('token'); // Adjust based on your auth setup
      try {
        const response = await axios.get('http://localhost:8000/api/hospital/resources/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = response.data;
        const camelCaseData = {};
        Object.entries(data).forEach(([key, value]) => {
          const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          if (['totalBeds', 'availableBeds', 'oxygenCylinders', 'ventilators', 'icuBeds', 'totalPatients', 'doctors', 'nurses', 'ambulances', 'emergencyRooms'].includes(camelKey)) {
            camelCaseData[camelKey] = value;
          }
        });
        setResources(camelCaseData);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    };
    fetchResources();
  }, []);

  const updateResource = (key, delta) => {
    setResources((prev) => {
      const newValue = Math.max(0, prev[key] + delta);
      if (key === 'availableBeds' && newValue > prev.totalBeds) {
        return prev; // Prevent availableBeds from exceeding totalBeds
      }
      return { ...prev, [key]: newValue };
    });
  };

  const handleSliderChange = (key, value) => {
    setResources((prev) => {
      if (key === 'availableBeds' && value > prev.totalBeds) {
        return prev; // Prevent availableBeds from exceeding totalBeds
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSave = async () => {
    if (resources.availableBeds > resources.totalBeds) {
      alert('Available beds cannot exceed total beds.');
      return;
    }
    const token = localStorage.getItem('token');
    const dataToSend = {};
    Object.entries(resources).forEach(([key, value]) => {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      dataToSend[snakeKey] = value;
    });
    try {
      const response = await axios.put('http://localhost:8000/api/hospital/resources/', dataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // console.log('Resources updated:', response.data);
      alert('Resources updated successfully');
    } catch (error) {
      console.error('Error updating resources:', error);
      alert('Failed to update resources');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onGoBack}>
            <BackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Detailed Hospital Resources
          </Typography>
          <Avatar sx={{ bgcolor: 'grey.300' }}>
            <HospitalIcon />
          </Avatar>
        </Toolbar>
      </AppBar>

      <Box sx={{ py: 4, bgcolor: 'primary.light' }}>
        <Container>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center', bgcolor: 'white' }}>
            <Typography variant="h4" gutterBottom>
              Hospital Resource Management Dashboard
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Monitor and update hospital resources in real-time. Use the interactive controls below to adjust resource counts.
            </Typography>
          </Paper>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card elevation={3}>
                  <CardHeader
                    avatar={<AssessmentIcon color="primary" fontSize="large" />}
                    title="Overall Capacity"
                  />
                  <CardContent>
                    <Typography variant="h5" color="primary">
                      {resources.totalBeds} Beds
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {resources.availableBeds} available
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card elevation={3}>
                  <CardHeader
                    avatar={<EventIcon color="secondary" fontSize="large" />}
                    title="Patient Load"
                  />
                  <CardContent>
                    <Typography variant="h5" color="secondary">
                      {resources.totalPatients} Patients
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Monitor current patient load
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card elevation={3}>
                  <CardHeader
                    avatar={<TrendingUpIcon color="action" fontSize="large" />}
                    title="Critical Care"
                  />
                  <CardContent>
                    <Typography variant="h5" color="error">
                      {resources.icuBeds} ICU Beds
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {resources.ventilators} Ventilators
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          <Divider sx={{ width: '100%', my: 4 }} />

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Resource Details
            </Typography>
          </Grid>
          {Object.keys(resources).map((key) => (
            <Grid item xs={12} md={6} key={key}>
              <Card elevation={2}>
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1')}
                    </Typography>
                  }
                />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="body1">Current Count:</Typography>
                    <Typography variant="h5" color="primary">
                      {resources[key]}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
                    <IconButton onClick={() => updateResource(key, -1)}>
                      <RemoveIcon color="error" />
                    </IconButton>
                    <Slider
                      value={resources[key]}
                      onChange={(e, val) => handleSliderChange(key, val)}
                      min={0}
                      max={500}
                      sx={{ width: 250, mx: 2 }}
                    />
                    <IconButton onClick={() => updateResource(key, 1)}>
                      <AddIcon color="primary" />
                    </IconButton>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="body2" color="textSecondary">
                      Adjust the count as needed. This value will be used for real-time updates.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}

          <Divider sx={{ width: '100%', my: 4 }} />

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Staff & Emergency Support
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader
                title="Medical Staff"
                subheader="Doctors and Nurses"
                avatar={<PeopleIcon color="action" fontSize="large" />}
              />
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body1">Doctors:</Typography>
                  <Typography variant="h5" color="primary">
                    {resources.doctors}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">Nurses:</Typography>
                  <Typography variant="h5" color="primary">
                    {resources.nurses}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={2}>
              <CardHeader
                title="Emergency Services"
                subheader="Ambulances & Emergency Rooms"
                avatar={<HealingIcon color="error" fontSize="large" />}
              />
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body1">Ambulances:</Typography>
                  <Typography variant="h5" color="primary">
                    {resources.ambulances}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1">Emergency Rooms:</Typography>
                  <Typography variant="h5" color="primary">
                    {resources.emergencyRooms}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} textAlign="center" sx={{ mt: 4 }}>
            <Button variant="contained" color="primary" size="large" onClick={handleSave} sx={{ mr: 2 }}>
              Save Changes
            </Button>
            <Button variant="contained" color="secondary" size="large" onClick={onGoBack}>
              Back to Dashboard
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ViewAllResources;