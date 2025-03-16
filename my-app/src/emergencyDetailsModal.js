import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Stack,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  LocalHospital as MedicalIcon,
  Accessible as PatientIcon,
  DirectionsCar as VehicleIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  EventNote as NotesIcon,
  CheckCircle as CheckIcon,
  Description as DocumentIcon,
  DocumentScanner as ReportIcon,
  Person as PersonIcon,
  Paid as PaymentIcon,
  Star as RatingIcon,
  MedicalServices as TreatmentIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';

// This component will be used in the PatientDashboard.js file
const EmergencyDetailsModal = ({ open, onClose, emergency }) => {
  // Sample detailed emergency data - in a real app, you would fetch this based on emergency.id
  const emergencyDetails = {
    id: emergency?.id || 1,
    date: emergency?.date || '2025-02-08',
    time: {
      reported: '14:32:18',
      dispatched: '14:33:45',
      arrived: '14:40:12',
      completed: '14:47:35'
    },
    type: emergency?.type || 'Medical Emergency',
    description: 'Patient reported severe chest pain and difficulty breathing',
    location: {
      address: '123 Emergency Street, Downtown',
      coordinates: '37.7749° N, 122.4194° W',
      additionalInfo: 'Apartment 4B, 2nd floor, door code: 4321'
    },
    responder: {
      type: emergency?.response || 'Uber Driver',
      name: 'Alex Johnson',
      id: 'DR-78542',
      vehicle: 'Toyota Innova - White (LIC: ABC-1234)',
      rating: 4.9,
      phone: '(+91) 9876543210'
    },
    patient: {
      name: 'Animesh Kumar',
      age: 35,
      bloodType: 'O+',
      allergies: 'Penicillin, Peanuts',
      medicalHistory: 'Hypertension, Asthma',
      primaryPhysician: 'Dr. Sarah Wilson'
    },
    treatment: {
      initialAssessment: 'Patient conscious but in distress; vitals stable',
      actionsTaken: 'Administered oxygen, patient stabilized during transport',
      medications: 'Aspirin 325mg administered as precaution',
      destination: 'City General Hospital - Emergency Department'
    },
    billing: {
      totalCost: '₹1207.00',
      insuranceCoverage: '₹520',
      patientResponsibility: '₹687',
      paymentStatus: 'Processed'
    },
    feedback: {
      patientRating: 5,
      comments: 'Very quick response, professional driver who knew exactly what to do.'
    },
    documents: [
      { type: 'Medical Report', id: 'MR-29384', date: '2025-02-08' },
      { type: 'Insurance Claim', id: 'IC-56123', date: '2025-02-09' }
    ]
  };

  if (!emergency) {
    return null;
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'primary.main',
        color: 'white',
        px: 3,
        py: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MedicalIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Emergency Response Details</Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {emergencyDetails.type} Response
              </Typography>
              <Typography color="text.secondary">
                Incident #{emergencyDetails.id} • {emergencyDetails.date}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Chip 
                icon={<CheckIcon />} 
                label="Completed" 
                color="success" 
                sx={{ fontWeight: 'bold', fontSize: '0.9rem', py: 2.5, px: 1 }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Response Timeline Section - Modified to use standard MUI components */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h6" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            color: 'primary.main',
            fontWeight: 'bold'
          }}>
            <TimelineIcon sx={{ mr: 1 }} />
            Response Timeline
          </Typography>

          {/* Custom timeline using standard MUI components */}
          <Stack spacing={1} sx={{ position: 'relative' }}>
            {/* Vertical timeline line */}
            <Box sx={{ 
              position: 'absolute', 
              left: '50%', 
              height: '100%', 
              width: 2, 
              bgcolor: 'grey.300',
              transform: 'translateX(-50%)',
              zIndex: 0
            }} />
            
            {/* Timeline Items */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: '45%', textAlign: 'right', pr: 2 }}>
                <Typography color="text.secondary">
                  {emergencyDetails.time.reported}
                </Typography>
              </Box>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: 'error.main', 
                mt: 0.5,
                border: '2px solid white',
                boxShadow: 1
              }} />
              <Box sx={{ width: '45%', pl: 2 }}>
                <Typography variant="body1" fontWeight="medium">Emergency Reported</Typography>
                <Typography variant="body2" color="text.secondary">Via Emergency App</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: '45%', textAlign: 'right', pr: 2 }}>
                <Typography variant="body1" fontWeight="medium">Responder Dispatched</Typography>
                <Typography variant="body2" color="text.secondary">{emergencyDetails.responder.type} assigned</Typography>
              </Box>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: 'warning.main', 
                mt: 0.5,
                border: '2px solid white',
                boxShadow: 1
              }} />
              <Box sx={{ width: '45%', pl: 2 }}>
                <Typography color="text.secondary">
                  {emergencyDetails.time.dispatched}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: '45%', textAlign: 'right', pr: 2 }}>
                <Typography color="text.secondary">
                  {emergencyDetails.time.arrived}
                </Typography>
              </Box>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: 'info.main', 
                mt: 0.5,
                border: '2px solid white',
                boxShadow: 1
              }} />
              <Box sx={{ width: '45%', pl: 2 }}>
                <Typography variant="body1" fontWeight="medium">Arrived at Location</Typography>
                <Typography variant="body2" color="text.secondary">Patient contact made</Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <Box sx={{ width: '45%', textAlign: 'right', pr: 2 }}>
                <Typography variant="body1" fontWeight="medium">Emergency Resolved</Typography>
                <Typography variant="body2" color="text.secondary">Transport to {emergencyDetails.treatment.destination}</Typography>
              </Box>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: 'success.main', 
                mt: 0.5,
                border: '2px solid white',
                boxShadow: 1
              }} />
              <Box sx={{ width: '45%', pl: 2 }}>
                <Typography color="text.secondary">
                  {emergencyDetails.time.completed}
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Main Content Sections */}
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={6}>
            {/* Location Card */}
            <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}>
                  <LocationIcon sx={{ mr: 1 }} />
                  Location Details
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {emergencyDetails.location.address}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Coordinates: {emergencyDetails.location.coordinates}
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  Additional Info: {emergencyDetails.location.additionalInfo}
                </Typography>
              </CardContent>
            </Card>

            {/* Responder Card */}
            <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'primary.main',
                    fontWeight: 'bold'
                  }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    Responder Information
                  </Typography>
                  <Chip 
                    icon={<RatingIcon fontSize="small" />} 
                    label={`${emergencyDetails.responder.rating} ★`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                    {emergencyDetails.responder.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {emergencyDetails.responder.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {emergencyDetails.responder.id}
                    </Typography>
                  </Box>
                </Box>
                
                <List dense disablePadding>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <VehicleIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={emergencyDetails.responder.vehicle} 
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <TimeIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={`Response time: ${emergency.duration}`} 
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>

            {/* Billing Card */}
            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}>
                  <PaymentIcon sx={{ mr: 1 }} />
                  Billing Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Total Cost</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {emergencyDetails.billing.totalCost}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Insurance Coverage</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {emergencyDetails.billing.insuranceCoverage}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Your Responsibility</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {emergencyDetails.billing.patientResponsibility}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Payment Status</Typography>
                    <Chip 
                      label={emergencyDetails.billing.paymentStatus} 
                      size="small" 
                      color="success"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={6}>
            {/* Patient Details Card */}
            <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}>
                  <PatientIcon sx={{ mr: 1 }} />
                  Patient Information
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {emergencyDetails.patient.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Age</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {emergencyDetails.patient.age} years
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Blood Type</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {emergencyDetails.patient.bloodType}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Allergies</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {emergencyDetails.patient.allergies}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Medical History</Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {emergencyDetails.patient.medicalHistory}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Treatment Details Card */}
            <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}>
                  <TreatmentIcon sx={{ mr: 1 }} />
                  Treatment Details
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>Initial Assessment</Typography>
                <Typography variant="body1" paragraph>
                  {emergencyDetails.treatment.initialAssessment}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>Actions Taken</Typography>
                <Typography variant="body1" paragraph>
                  {emergencyDetails.treatment.actionsTaken}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>Medications</Typography>
                <Typography variant="body1" paragraph>
                  {emergencyDetails.treatment.medications}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>Destination</Typography>
                <Typography variant="body1">
                  {emergencyDetails.treatment.destination}
                </Typography>
              </CardContent>
            </Card>

            {/* Documents Card */}
            <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 2,
                  color: 'primary.main',
                  fontWeight: 'bold'
                }}>
                  <DocumentIcon sx={{ mr: 1 }} />
                  Related Documents
                </Typography>
                
                <List>
                  {emergencyDetails.documents.map((doc) => (
                    <ListItem 
                      key={doc.id}
                      secondaryAction={
                        <Button size="small" startIcon={<ReportIcon />} variant="outlined">
                          View
                        </Button>
                      }
                    >
                      <ListItemIcon>
                        <DocumentIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={doc.type} 
                        secondary={`ID: ${doc.id} • ${doc.date}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Feedback Section */}
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Your Feedback</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>Your Rating:</Typography>
            {[...Array(5)].map((_, i) => (
              <RatingIcon 
                key={i} 
                color={i < emergencyDetails.feedback.patientRating ? "primary" : "disabled"} 
                fontSize="small"
              />
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary">
            "{emergencyDetails.feedback.comments}"
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyDetailsModal;