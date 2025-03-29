import React, { useState } from 'react';
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

// Initial resource state with detailed hospital information
const initialResources = {
  totalBeds: 200,
  availableBeds: 120,
  oxygenCylinders: 80,
  ventilators: 25,
  icuBeds: 30,
  totalPatients: 150,
  doctors: 50,
  nurses: 80,
  ambulances: 10,
  emergencyRooms: 12
};

// Updated component to accept onGoBack prop for navigation
const ViewAllResources = ({ onGoBack }) => {
  const [resources, setResources] = useState(initialResources);

  // Handler to update resources by increasing or decreasing the value
  const updateResource = (key, delta) => {
    setResources((prev) => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
  };

  // Handler for slider change
  const handleSliderChange = (key, value) => {
    setResources((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Top AppBar */}
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

      {/* Header Section */}
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

      {/* Main Content */}
      <Container sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Summary Cards Section */}
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

          {/* Detailed Resource Management Section */}
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

          {/* Staff and Ambulance Section */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Staff &amp; Emergency Support
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
                subheader="Ambulances &amp; Emergency Rooms"
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

          {/* Final Action Button - Updated to use the onGoBack prop */}
          <Grid item xs={12} textAlign="center" sx={{ mt: 4 }}>
            <Button variant="contained" color="primary" size="large" onClick={onGoBack}>
              Back to Dashboard
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ViewAllResources;