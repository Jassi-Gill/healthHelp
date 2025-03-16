import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Divider,
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
  PersonPinCircle as PersonTrackerIcon
} from '@mui/icons-material';

const EmergencyAmbulanceCalling = ({ onClose }) => {
  // State variables
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, ongoing, dispatched, completed
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

  // Mock data
  const emergencyDetails = {
    id: 'EM-25789',
    location: {
      address: '123 Emergency St, City Center',
      coordinates: '37.7749° N, 122.4194° W',
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
      hospital: 'City General Hospital'
    },
    vitalSigns: {
      heartRate: '85 bpm',
      oxygenLevel: '96%',
      bloodPressure: '120/80'
    }
  };

  // Steps for the emergency response process
  const steps = [
    'Call Connected',
    'Ambulance Dispatched',
    'Ambulance En Route',
    'Ambulance Arrived'
  ];

  // Timer effect for call duration
  useEffect(() => {
    let timer;
    if (callStatus === 'connecting' || callStatus === 'ongoing') {
      timer = setInterval(() => {
        setCallDuration(prevDuration => prevDuration + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // Effect to progress through call stages (for demo purposes)
  useEffect(() => {
    let statusTimer;
    
    if (callStatus === 'connecting') {
      statusTimer = setTimeout(() => {
        setCallStatus('ongoing');
        setActiveStep(1);
      }, 3000);
    } else if (callStatus === 'ongoing') {
      statusTimer = setTimeout(() => {
        setCallStatus('dispatched');
        setActiveStep(2);
      }, 10000);
    } else if (callStatus === 'dispatched' && activeStep === 2) {
      statusTimer = setTimeout(() => {
        setActiveStep(3);
      }, 15000);
    }
    
    return () => clearTimeout(statusTimer);
  }, [callStatus, activeStep]);

  // Function to format time (for call duration)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to handle sending new chat messages
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
      
      // Simulate operator response
      setTimeout(() => {
        const operatorResponse = {
          id: chatMessages.length + 2,
          sender: 'operator',
          message: 'Thank you for the information. The ambulance is on its way. Please stay on the line.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatMessages(prevMessages => [...prevMessages, operatorResponse]);
      }, 3000);
    }
  };

  // Function to handle ending the call
  const handleEndCall = () => {
    setCallStatus('completed');
    onClose();
  };

  return (
    <Dialog 
      open={true} 
      fullScreen
      TransitionComponent={Fade}
      transitionDuration={500}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(to bottom, #f44336 0%, #d32f2f 100%)'
      }}>
        {/* Top Bar */}
        <Box sx={{ 
          px: 2, 
          py: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}>
          <Typography variant="subtitle1" color="white" fontWeight="bold">
            EMERGENCY CALL - {callStatus.toUpperCase()}
          </Typography>
          <Box display="flex" alignItems="center">
            <Chip 
              icon={<ClockIcon sx={{ color: 'white !important' }} />}
              label={formatTime(callDuration)}
              sx={{ 
                mr: 2, 
                bgcolor: 'rgba(255, 255, 255, 0.15)', 
                color: 'white',
                '& .MuiChip-icon': { color: 'white' } 
              }}
            />
            <IconButton color="inherit" onClick={handleEndCall}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3
        }}>
          {/* Call Status Section */}
          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <Paper 
              elevation={8} 
              sx={{ 
                width: '100%', 
                maxWidth: 600, 
                mb: 3, 
                borderRadius: 4,
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                p: 3, 
                textAlign: 'center',
                backgroundColor: callStatus === 'connecting' ? '#f44336' : '#d32f2f',
                color: 'white'
              }}>
                {callStatus === 'connecting' ? (
                  <>
                    <CircularProgress color="inherit" size={60} sx={{ mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      Connecting to Emergency Services
                    </Typography>
                    <Typography variant="body2">
                      Please stay on the line...
                    </Typography>
                  </>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Avatar 
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          margin: '0 auto',
                          bgcolor: 'white'
                        }}
                      >
                        <HospitalIcon color="error" sx={{ fontSize: 40 }} />
                      </Avatar>
                    </Box>
                    <Typography variant="h5" gutterBottom>
                      Emergency Call Active
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Call ID: {emergencyDetails.id}
                    </Typography>
                    <Chip 
                      icon={<PhoneIcon />} 
                      label="Emergency Line Connected" 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)', 
                        color: 'white' 
                      }} 
                    />
                  </>
                )}
              </Box>

              <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {activeStep >= 1 && (
                <Box sx={{ p: 3, bgcolor: 'background.paper', borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    RESPONDER INFORMATION
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={2}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <PersonPinIcon />
                      </Avatar>
                    </Grid>
                    <Grid item xs={10}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {emergencyDetails.responder.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Emergency Medical Technician
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={2}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <CarIcon />
                      </Avatar>
                    </Grid>
                    <Grid item xs={10}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {emergencyDetails.responder.vehicle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        License: {emergencyDetails.responder.licensePlate}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        mt: 1,
                        bgcolor: 'success.light',
                        borderRadius: 2
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

          {/* Location Info */}
          <Zoom in={true} style={{ transitionDelay: '400ms' }}>
            <Paper 
              elevation={6}
              sx={{ 
                width: '100%', 
                maxWidth: 600, 
                mb: 3, 
                borderRadius: 4,
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                p: 2, 
                bgcolor: 'info.main', 
                color: 'white',
                display: 'flex',
                alignItems: 'center'
              }}>
                <LocationIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Current Location
                </Typography>
              </Box>
              <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="body1" fontWeight="medium">
                  {emergencyDetails.location.address}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {emergencyDetails.location.landmark}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  GPS: {emergencyDetails.location.coordinates}
                </Typography>
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 1, 
                    display: 'flex', 
                    alignItems: 'center',
                    bgcolor: 'grey.100',
                    borderRadius: 2
                  }}
                >
                  <InfoIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Location is being shared with emergency services
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Zoom>

          {/* Action Buttons */}
          <Box sx={{ width: '100%', maxWidth: 600, mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button 
                  variant="contained" 
                  fullWidth
                  size="large"
                  startIcon={<MessageIcon />}
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                    py: 1.5
                  }}
                  onClick={() => setShowChat(!showChat)}
                >
                  Text Chat
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button 
                  variant="contained" 
                  fullWidth
                  size="large"
                  startIcon={<PersonTrackerIcon />}
                  sx={{ 
                    bgcolor: 'white', 
                    color: 'error.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                    py: 1.5
                  }}
                  onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                >
                  Patient Info
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Media Controls */}
          <Zoom in={true} style={{ transitionDelay: '500ms' }}>
            <Paper 
              elevation={10}
              sx={{ 
                width: '100%', 
                maxWidth: 600, 
                borderRadius: 4,
                bgcolor: 'white',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ p: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-around', 
                    mb: 2 
                  }}
                >
                  <IconButton sx={{ bgcolor: 'grey.200' }}>
                    <VolumeUpIcon />
                  </IconButton>
                  <IconButton sx={{ bgcolor: 'grey.200' }}>
                    <MicIcon />
                  </IconButton>
                  <IconButton sx={{ bgcolor: 'grey.200' }}>
                    <CameraIcon />
                  </IconButton>
                  <IconButton sx={{ bgcolor: 'grey.200' }}>
                    <WhatsAppIcon />
                  </IconButton>
                </Box>
                <Button 
                  variant="contained" 
                  fullWidth
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
        </Box>

        {/* Additional Info Dialog */}
        <Dialog 
          open={showAdditionalInfo} 
          onClose={() => setShowAdditionalInfo(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <Box display="flex" alignItems="center">
              <MedicalIcon sx={{ mr: 1 }} />
              Patient Medical Information
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                PATIENT DETAILS
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Name:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">{emergencyDetails.patient.name}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Age:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">{emergencyDetails.patient.age}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Blood Type:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">{emergencyDetails.patient.bloodType}</Typography>
                </Grid>
              </Grid>
            </Box>
            
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                MEDICAL CONDITIONS
              </Typography>
              <List dense>
                {emergencyDetails.patient.medicalConditions.map((condition, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <HeartIcon color="error" />
                    </ListItemIcon>
                    <ListItemText primary={condition} />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Box mb={3}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                ALLERGIES
              </Typography>
              <List dense>
                {emergencyDetails.patient.allergies.map((allergy, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <MedicalIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={allergy} />
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                EMERGENCY CONTACT
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Name:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">{emergencyDetails.emergencyContact.name}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Relationship:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">{emergencyDetails.emergencyContact.relationship}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Phone:</Typography>
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="body1">{emergencyDetails.emergencyContact.phone}</Typography>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAdditionalInfo(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Text Chat Dialog */}
        <Dialog 
          open={showChat} 
          onClose={() => setShowChat(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{ 
            sx: { 
              height: '70vh',
              display: 'flex',
              flexDirection: 'column'
            } 
          }}
        >
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <Box display="flex" alignItems="center">
              <MessageIcon sx={{ mr: 1 }} />
              Emergency Text Chat
            </Box>
          </DialogTitle>
          <DialogContent 
            dividers
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              p: 2
            }}
          >
            <Box sx={{ 
              flex: 1, 
              overflowY: 'auto', 
              mb: 2,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {chatMessages.map((chat) => (
                <Box 
                  key={chat.id} 
                  sx={{ 
                    alignSelf: chat.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    mb: 2
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: chat.sender === 'user' ? 'primary.light' : 'grey.100',
                      color: chat.sender === 'user' ? 'white' : 'inherit'
                    }}
                  >
                    <Typography variant="body1">{chat.message}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                      {chat.timestamp}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Type your message..."
                variant="outlined"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                sx={{ mr: 1 }}
              />
              <IconButton 
                color="primary" 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </Dialog>
  );
};

export default EmergencyAmbulanceCalling;