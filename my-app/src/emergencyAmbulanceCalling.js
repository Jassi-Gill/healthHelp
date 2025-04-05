import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fade,
  Zoom,
  Backdrop
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  AccessTime as ClockIcon,
  Info as InfoIcon,
  LocalHospital as HospitalIcon,
  PersonPin as PersonPinIcon,
  DirectionsCar as CarIcon,
  HealthAndSafety as MedicalIcon,
  VolumeUp as VolumeUpIcon,
  Mic as MicIcon,
  Send as SendIcon,
  MessageOutlined as MessageIcon,
  CameraAlt as CameraIcon,
  HeartBroken as HeartIcon,
  WhatsApp as WhatsAppIcon,
  PhoneDisabled as PhoneDisabledIcon,
  PersonPinCircle as PersonTrackerIcon,
  Minimize as MinimizeIcon
} from '@mui/icons-material';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';

const EmergencyAmbulanceCalling = ({ onClose, onEndCall, emergencyRequest }) => {
  const [callStatus, setCallStatus] = useState('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'operator',
      message: 'Emergency response operator here. Can you describe the emergency situation?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [directions, setDirections] = useState(null);
  const [componentsEnabled, setComponentsEnabled] = useState({
    chat: false,
    patientInfo: false,
    mediaControls: false
  });
  const [isMinimized, setIsMinimized] = useState(false);

  const emergencyDetails = {
    id: 'EM-25789',
    location: {
      address: emergencyRequest?.start_location_name || '123 Emergency St, City Center',
      coordinates: `${emergencyRequest?.start_location_latitude || 37.7749}° N, ${emergencyRequest?.start_location_longitude || 122.4194}° W`,
      landmark: 'Near Central Park'
    },
    patient: {
      name: 'John Doe',
      age: 35,
      bloodType: 'O+',
      allergies: ['Penicillin'],
      medicalConditions: ['Asthma']
    },
    emergencyContact: {
      name: 'John',
      relationship: 'Spouse',
      phone: '+91 5551234567'
    },
    responder: {
      name: 'Dr. Michael Williams',
      vehicle: 'Ambulance A-105',
      eta: '4 minutes',
      licensePlate: 'AMB-1234',
      hospital: emergencyRequest?.end_location_name || 'City General Hospital'
    }
  };

  const steps = [
    'Call Connected',
    'Ambulance Dispatched',
    'Ambulance En Route',
    'Ambulance Arrived'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (callStatus !== 'completed') {
        setCallDuration(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [callStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (callStatus === 'connecting') {
        setCallStatus('ongoing');
        setActiveStep(1);
      } else if (activeStep < steps.length - 1) {
        setActiveStep(prev => prev + 1);
      }
    }, activeStep === 0 ? 3000 : 10000);

    return () => clearTimeout(timer);
  }, [activeStep, callStatus, steps.length]);

  useEffect(() => {
    const enabledComponents = {
      chat: activeStep >= 1,
      patientInfo: activeStep >= 2,
      mediaControls: activeStep >= 3
    };
    setComponentsEnabled(enabledComponents);
  }, [activeStep]);

  useEffect(() => {
    if (!emergencyRequest) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route({
      origin: {
        lat: emergencyRequest.start_location_latitude,
        lng: emergencyRequest.start_location_longitude
      },
      destination: {
        lat: emergencyRequest.end_location_latitude,
        lng: emergencyRequest.end_location_longitude
      },
      travelMode: window.google.maps.TravelMode.DRIVING,
    }, (result, status) => {
      if (status === 'OK') setDirections(result);
    });
  }, [emergencyRequest]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newChat = {
        id: chatMessages.length + 1,
        sender: 'user',
        message: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newChat]);
      setNewMessage('');
      setTimeout(() => {
        const operatorResponse = {
          id: chatMessages.length + 2,
          sender: 'operator',
          message: 'Thank you for the information. The ambulance is on its way. Please stay on the line.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prev => [...prev, operatorResponse]);
      }, 3000);
    }
  };

  const handleEndCall = () => {
    setCallStatus('completed');
    onEndCall(emergencyRequest);
    onClose();
  };

  return (
    <Dialog
      open
      onClose={() => !isMinimized && onClose()}
      hideBackdrop={isMinimized}
      disableEnforceFocus={isMinimized}
      sx={{
        '& .MuiDialog-paper': isMinimized ? {
          width: '300px',
          height: '100px',
          position: 'fixed',
          bottom: 0,
          right: 0,
          m: 0,
        } : {
          width: '90vw',
          height: '90vh',
          m: 'auto',
        }
      }}
    >
      {isMinimized ? (
        <Box p={2}>
          <Typography>Ongoing Emergency Call - {formatTime(callDuration)}</Typography>
          <Button onClick={() => setIsMinimized(false)}>Maximize</Button>
          <Button onClick={handleEndCall}>End Call</Button>
        </Box>
      ) : (
        <Box sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(to bottom, #f44336 0%, #d32f2f 100%)'
        }}>
          <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" color="white" fontWeight="bold">
              EMERGENCY CALL - {callStatus.toUpperCase()}
            </Typography>
            <Box display="flex" alignItems="center">
              <Chip
                icon={<ClockIcon sx={{ color: 'white' }} />}
                label={formatTime(callDuration)}
                sx={{ mr: 2, bgcolor: 'rgba(255, 255, 255, 0.15)', color: 'white' }}
              />
              <IconButton color="inherit" onClick={() => setIsMinimized(true)}>
                <MinimizeIcon />
              </IconButton>
              <IconButton color="inherit" onClick={handleEndCall}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            {emergencyRequest?.start_location_latitude ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '300px' }}
                center={{ lat: emergencyRequest.start_location_latitude, lng: emergencyRequest.start_location_longitude }}
                zoom={13}
              >
                <Marker position={{ lat: emergencyRequest.start_location_latitude, lng: emergencyRequest.start_location_longitude }} />
                <Marker position={{ lat: emergencyRequest.end_location_latitude, lng: emergencyRequest.end_location_longitude }} />
                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            ) : (
              <Typography variant="body1" color="text.secondary" textAlign="center">
                Map unavailable. Location data missing.
              </Typography>
            )}
          </Box>

          <Box sx={{ flex: 1, p: 3, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Zoom in style={{ transitionDelay: '300ms' }}>
              <Paper elevation={8} sx={{ width: '100%', maxWidth: 600, mb: 3, borderRadius: 4 }}>
                <Box sx={{ p: 3, textAlign: 'center', bgcolor: callStatus === 'connecting' ? '#f44336' : '#d32f2f', color: 'white' }}>
                  {callStatus === 'connecting' ? (
                    <>
                      <CircularProgress color="inherit" size={60} sx={{ mb: 2 }} />
                      <Typography variant="h5">Connecting to Emergency Services</Typography>
                      <Typography variant="body2">Please stay on the line...</Typography>
                    </>
                  ) : (
                    <>
                      <Avatar sx={{ width: 80, height: 80, bgcolor: 'white', mb: 2 }}>
                        <HospitalIcon color="error" sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h5">Emergency Call Active</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>Call ID: {emergencyDetails.id}</Typography>
                      <Chip
                        icon={<PhoneIcon />}
                        label="Emergency Line Connected"
                        sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                      />
                    </>
                  )}
                </Box>
                <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                      <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                  </Stepper>
                </Box>
                {activeStep >= 1 && (
                  <Box sx={{ p: 3, bgcolor: 'background.paper', borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      RESPONDER INFORMATION
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                            <PersonPinIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {emergencyDetails.responder.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Emergency Medical Technician
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                            <CarIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {emergencyDetails.responder.vehicle}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              License: {emergencyDetails.responder.licensePlate}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{
                          p: 2,
                          mt: 1,
                          bgcolor: 'success.light',
                          borderRadius: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Box display="flex" alignItems="center">
                            <ClockIcon sx={{ mr: 1, color: 'success.dark' }} />
                            <Typography fontWeight="bold" color="success.dark">
                              Estimated Arrival
                            </Typography>
                          </Box>
                          <Typography variant="h6" color="success.dark">
                            {emergencyDetails.responder.eta}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Zoom>

            <Zoom in style={{ transitionDelay: '400ms' }}>
              <Paper elevation={6} sx={{ width: '100%', maxWidth: 600, mb: 3, borderRadius: 4 }}>
                <Box sx={{ p: 2, bgcolor: 'info.main', color: 'white', display: 'flex', alignItems: 'center' }}>
                  <LocationIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle1" fontWeight="bold">Current Location</Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                  <Typography variant="body1" fontWeight="medium">
                    {emergencyDetails.location.address}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {emergencyDetails.location.landmark}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    GPS: {emergencyDetails.location.coordinates}
                  </Typography>
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.100', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                    <InfoIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Location is being shared with emergency services
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Zoom>

            <Box sx={{ width: '100%', maxWidth: 600, mb: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<MessageIcon />}
                    disabled={!componentsEnabled.chat}
                    onClick={() => setShowChat(true)}
                    sx={{
                      bgcolor: 'white',
                      color: 'error.main',
                      py: 1.5,
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    Text Chat
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<PersonTrackerIcon />}
                    disabled={!componentsEnabled.patientInfo}
                    onClick={() => setShowAdditionalInfo(true)}
                    sx={{
                      bgcolor: 'white',
                      color: 'error.main',
                      py: 1.5,
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    Patient Info
                  </Button>
                </Grid>
              </Grid>
            </Box>

            {componentsEnabled.mediaControls && (
              <Zoom in style={{ transitionDelay: '500ms' }}>
                <Paper elevation={10} sx={{ width: '100%', maxWidth: 600, borderRadius: 4 }}>
                  <Box sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
                      <IconButton sx={{ bgcolor: 'grey.200' }}><VolumeUpIcon /></IconButton>
                      <IconButton sx={{ bgcolor: 'grey.200' }}><MicIcon /></IconButton>
                      <IconButton sx={{ bgcolor: 'grey.200' }}><CameraIcon /></IconButton>
                      <IconButton sx={{ bgcolor: 'grey.200' }}><WhatsAppIcon /></IconButton>
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      size="large"
                      startIcon={<PhoneDisabledIcon />}
                      sx={{ py: 1.5 }}
                      onClick={handleEndCall}
                    >
                      End Emergency Call
                    </Button>
                  </Box>
                </Paper>
              </Zoom>
            )}
          </Box>

          <Dialog open={showAdditionalInfo} onClose={() => setShowAdditionalInfo(false)} fullWidth maxWidth="sm">
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <Box display="flex" alignItems="center">
                <MedicalIcon sx={{ mr: 1 }} />
                Patient Medical Information
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {/* Patient details content */}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowAdditionalInfo(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={showChat}
            onClose={() => setShowChat(false)}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { height: '70vh', display: 'flex', flexDirection: 'column' } }}
          >
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <Box display="flex" alignItems="center">
                <MessageIcon sx={{ mr: 1 }} />
                Emergency Text Chat
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
              {/* Chat messages content */}
            </DialogContent>
          </Dialog>
        </Box>
      )}
    </Dialog>
  );
};

export default EmergencyAmbulanceCalling;