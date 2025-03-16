import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  Navigation as NavigationIcon,
  MyLocation as TargetIcon,
  AccessTime as ClockIcon,
  LocalPolice as PoliceIcon,
  Speed as SpeedIcon,
  Warning as WarningIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const MapDetails = ({ emergency, onClose }) => {
  // Sample data - would come from your backend
  const [activeStep, setActiveStep] = useState(1);
  
  const emergencyDetails = {
    id: emergency?.id || 1,
    address: emergency?.location || "123 Main St",
    type: emergency?.type || "Accident",
    reportTime: "10:15 AM",
    reportedBy: "Animesh Kumar",
    description: "Very dangerous accident, hit and run case by Animesh Kumar.",
    priority: "High",
    coordinates: {
      latitude: "37.7749",
      longitude: "-122.4194"
    },
    nearbyResources: [
      { id: 1, type: "Police Car", distance: "0.8 miles", eta: "3 mins", officer: "Officer Jaswindar" },
      { id: 2, type: "Police Car", distance: "1.5 miles", eta: "5 mins", officer: "Officer Kunsh" }
    ],
    route: {
      distance: "2.7 miles",
      estimatedTime: emergency?.eta || "8 mins",
      trafficCondition: "Medium",
      optimalRoute: true
    },
    timeline: [
      { time: "10:15 AM", status: "Emergency Reported", completed: true },
      { time: "10:17 AM", status: "Dispatch Initiated", completed: true },
      { time: "10:19 AM", status: "En Route", completed: false },
      { time: "10:26 AM", status: "Arrived at Scene", completed: false }
    ],
    nearbyRisks: [
      "School zone 0.3 miles ahead",
      "Construction site near destination"
    ]
  };

  // Steps for the stepper component
  const steps = emergencyDetails.timeline.map(step => step.status);

  return (
    <Card sx={{ height: '100%', position: 'relative' }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center">
            <NavigationIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6">Emergency Navigation</Typography>
          </Box>
        }
        action={
          <Box>
            <IconButton onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        }
      />
      
      <CardContent>
        <Grid container spacing={3}>
          {/* Left column - Map and routing */}
          <Grid item xs={12} md={7}>
            {/* Map placeholder */}
            <Paper
              sx={{
                height: 300,
                width: '100%',
                bgcolor: 'grey.200',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 3
              }}
            >
              <LocationIcon sx={{ fontSize: 40, color: 'error.main', mb: 2 }} />
              <Typography variant="body1" align="center">
                Interactive Map View
              </Typography>
              <Typography variant="caption" color="textSecondary" align="center">
                {emergencyDetails.coordinates.latitude}, {emergencyDetails.coordinates.longitude}
              </Typography>
            </Paper>

            {/* Trip timeline */}
            <Typography variant="h6" gutterBottom>
              <ClockIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Trip Timeline
            </Typography>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>
                    {label}
                    <Typography variant="caption" display="block">
                      {emergencyDetails.timeline[index].time}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Trip details */}
            <Paper sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <CarIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                Route Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2">Distance:</Typography>
                  <Typography variant="body1" fontWeight="bold">{emergencyDetails.route.distance}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">ETA:</Typography>
                  <Typography variant="body1" fontWeight="bold">{emergencyDetails.route.estimatedTime}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Traffic:</Typography>
                  <Typography variant="body1" fontWeight="bold">{emergencyDetails.route.trafficCondition}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">Route:</Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    {emergencyDetails.route.optimalRoute ? "Optimal" : "Alternative"}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Warning alerts */}
            {emergencyDetails.nearbyRisks.length > 0 && (
              <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
                <Typography variant="subtitle1" color="error.dark" gutterBottom>
                  <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Alert Zones
                </Typography>
                <List dense>
                  {emergencyDetails.nearbyRisks.map((risk, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <WarningIcon color="error" />
                      </ListItemIcon>
                      <ListItemText primary={risk} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Grid>

          {/* Right column - Emergency details */}
          <Grid item xs={12} md={5}>
            {/* Emergency information */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.light' }}>
              <Typography variant="h6" color="error.dark" gutterBottom>
                <TargetIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Emergency Details
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Typography variant="body2">Type:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1" fontWeight="bold">{emergencyDetails.type}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2">Address:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1" fontWeight="bold">{emergencyDetails.address}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2">Reported:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">{emergencyDetails.reportTime}</Typography>
                </Grid>
                
                <Grid item xs={4}>
                  <Typography variant="body2">Priority:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1" fontWeight="bold" color="error.dark">{emergencyDetails.priority}</Typography>
                </Grid>
              </Grid>
              <Divider sx={{ my: 1 }} />
              <Typography variant="body2" gutterBottom>Description:</Typography>
              <Typography variant="body2" paragraph>
                {emergencyDetails.description}
              </Typography>
            </Paper>

            {/* Nearby resources */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                <PoliceIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                Nearby Resources
              </Typography>
              <List dense>
                {emergencyDetails.nearbyResources.map((resource) => (
                  <ListItem key={resource.id} sx={{ bgcolor: 'background.default', mb: 1, borderRadius: 1 }}>
                    <ListItemIcon>
                      <CarIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={resource.officer}
                      secondary={`${resource.type} • ${resource.distance} away • ETA ${resource.eta}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* Action buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={onClose}
              >
                Back to Dashboard
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SpeedIcon />}
              >
                Start Navigation
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MapDetails;