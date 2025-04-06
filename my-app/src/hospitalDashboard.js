import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Modal,
  Paper,
  TextField,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  LocalHospital as HospitalIcon,
  Notifications as BellIcon,
  Person as UserIcon,
  ReportProblem as AlertCircleIcon,
  People as UsersIcon,
  AccessTime as ClockIcon,
  LocationOn as MapPinIcon,
  BarChart as BarChartIcon,
  Phone as PhoneIcon,
  Directions as NavigationIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import MapDetails from './mapdetails';
import ViewAllResources from './ViewAllResources';
import axios from 'axios';

const HospitalDashboard = () => {
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [navigatingEmergency, setNavigatingEmergency] = useState(null);
  const [showResources, setShowResources] = useState(false);
  const [onDuty, setOnDuty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [treatmentFormOpen, setTreatmentFormOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const initialTreatmentFormData = {
    date: '',
    type: '',
    response: '',
    status: '',
    duration: '',
    admission_date: '',
    discharge_date: '',
    diagnosis: '',
    treatment_details: '',
    follow_up_required: false,
    // Patient Information
    patient_name: '',
    patient_age: '',
    patient_gender: '', // Initialize to empty string
    patient_contact: '',
    patient_blood_type: '', // Initialize to empty string
    allergies: '',
    medical_history: '',
    // Vital Signs (nested object)
    vital_signs: {
      blood_pressure: '',
      heart_rate: '',
      respiratory_rate: '',
      temperature: '',
      oxygen_saturation: '',
    },
    // Additional Treatment Fields
    emergency_type: '',
    request_date: '',
    response_time: '',
    location: '',
    medications: '',
    procedures_performed: '',
    doctor_assigned: '',
    nurse_assigned: '',
    follow_up_date: '',
    follow_up_instructions: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    insurance_provider: '',
    insurance_policy_number: '',
  };

  const [treatmentFormData, setTreatmentFormData] = useState(initialTreatmentFormData);

  useEffect(() => {
    const fetchHospitalStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/hospital/status/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setOnDuty(response.data.hospital_active);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching police status:', error);
        setLoading(false);
      }
    };

    fetchHospitalStatus();
  }, []);


  useEffect(() => {
    const fetchActiveEmergencies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/api/emergency-requests/', {
          headers: { Authorization: `Bearer ${token}` },
          params: { status: 'created' }
        });
        const transformedEmergencies = response.data.map(emergency => ({
          id: emergency.id,
          start_location: {
            lat: emergency.start_location_latitude,
            lng: emergency.start_location_longitude,
            name: emergency.start_location_name
          },
          end_location: {
            lat: emergency.end_location_latitude,
            lng: emergency.end_location_longitude,
            name: emergency.end_location_name
          },
          emergency_type: emergency.emergency_type,
          status: emergency.status,
          patient: emergency.patient, // Preserve patient data for the form
          // Add other fields as needed
          
        }));
        console.log(response.data);
        setActiveEmergencies(transformedEmergencies);
        console.log('Transformed Emergencies:', transformedEmergencies);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching active emergencies:', error);
        setSnackbar({
          open: true,
          message: 'Failed to fetch active emergencies',
          severity: 'error',
        });
        setLoading(false);
      }
    };
    fetchActiveEmergencies();
  }, []);

  // Simulated active emergencies matching the second image (Image 1)
  // useEffect(() => {
  //   const simulatedEmergencies = [
  //     {
  //       id: 1,
  //       start_location_name: 'Indian Institute of Information Technology (IIIT G) - IT, Park Street Bongora, 3HJ6+FV9, Borjhar, Guwahati, Salesala, Assam 781015, India',
  //       emergency_type: 'critical',
  //       status: 'created',
  //     },
  //     {
  //       id: 2,
  //       start_location_name: 'Indian Institute of Information Technology (IIIT G) - IT, Park Street Bongora, 3HJ6+FV9, Borjhar, Guwahati, Salesala, Assam 781015, India',
  //       emergency_type: 'critical',
  //       status: 'created',
  //     },
  //     {
  //       id: 3,
  //       start_location_name: '3HJ6+GRQ, Borjhar, Guwahati, Salesala, Assam 781015, India',
  //       emergency_type: 'critical',
  //       status: 'created',
  //     },
  //     {
  //       id: 4,
  //       start_location_name: '3HJ6+GRQ, Borjhar, Guwahati, Salesala, Assam 781015, India',
  //       emergency_type: 'non-critical',
  //       status: 'created',
  //     },
  //     {
  //       id: 5,
  //       start_location_name: '3HJ5+HBF, Dimu Dobak, Guwahati, Assam 781015, India',
  //       emergency_type: 'critical',
  //       status: 'created',
  //     },
  //     {
  //       id: 6,
  //       start_location_name: '3HJ5+HBF, Dimu Dobak, Guwahati, Assam 781015, India',
  //       emergency_type: 'critical',
  //       status: 'created',
  //     },
  //     {
  //       id: 7,
  //       start_location_name: '3HJ6+22, Borjhar, Guwahati, Bongara, Assam 781015, India',
  //       emergency_type: 'critical',
  //       status: 'created',
  //     },
  //   ];
  //   setActiveEmergencies(simulatedEmergencies);
  //   setLoading(false);
  // }, []);

  const handleDutyToggle = async () => {
    try {
      setLoading(true);
      const newStatus = !onDuty;
      const response = await axios.patch(
        'http://localhost:8000/api/hospital/status/',
        { hospital_active: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setOnDuty(newStatus);
      setSnackbar({
        open: true,
        message: `You are now ${newStatus ? 'on duty' : 'off duty'}`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Error updating duty status:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update status. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleNavigate = (emergency) => {
    if (emergency.start_location?.lat && emergency.start_location?.lng) {
      setNavigatingEmergency(emergency);
    } else {
      setSnackbar({
        open: true,
        message: 'No valid location data available for this emergency',
        severity: 'warning',
      });
    }
  };

  const handleCloseMap = () => {
    setNavigatingEmergency(null);
  };

  const goToViewAllResources = () => {
    setShowResources(true);
  };

  const goBackToDashboard = () => {
    setShowResources(false);
  };

  const handleOpenTreatmentForm = (emergency) => {
    setSelectedEmergency(emergency);
    const patient = emergency.patient || {};
    setTreatmentFormData({
      ...initialTreatmentFormData,
      // Emergency details
      emergency_type: emergency.emergency_type || '',
      status: emergency.status || '',
      location: emergency.start_location_name || '',
      request_date: emergency.created_at || '', // Add created_at if needed
      // Patient details
      patient_name: patient ? `${patient.first_name} ${patient.last_name}` : '',
      patient_gender: patient.gender || '',
      patient_contact: patient.mobile_numbers?.[0]?.mobile_number || '', // Assuming primary mobile number
      allergies: patient.allergies || '', // Add if Patient model is extended
      medical_history: patient.medical_histories?.map(history => history.description).join('; ') || '',
      // Document URLs (for display, not submission)
      face_image_url: patient.face_image_url || '',
      insurance_document_url: patient.insurance_document_url || '',
    });
    setTreatmentFormOpen(true);
  };

  const handleCloseTreatmentForm = () => {
    setTreatmentFormOpen(false);
    setSelectedEmergency(null);
  };

  const handleTreatmentFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      // Handle nested fields (e.g., vital_signs.blood_pressure)
      const [parent, child] = name.split('.');
      setTreatmentFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      // Handle flat fields
      setTreatmentFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmitTreatmentForm = async () => {
    // Construct vital_signs string from individual fields
    const vitalSigns = `BP: ${treatmentFormData.vital_signs?.blood_pressure || ''}, HR: ${treatmentFormData.vital_signs?.heart_rate || ''}, RR: ${treatmentFormData.vital_signs?.respiratory_rate || ''}, Temp: ${treatmentFormData.vital_signs?.temperature || ''}°C, SpO2: ${treatmentFormData.vital_signs?.oxygen_saturation || ''}%`;

    const formData = {
      patient: selectedEmergency.patient?.id || null,  // Assumes patient info is included in emergency data
      emergency_request: selectedEmergency.id,
      admission_date: treatmentFormData.admission_date || new Date().toISOString(),
      discharge_date: treatmentFormData.discharge_date || null,
      diagnosis: treatmentFormData.diagnosis || '',
      treatment_details: treatmentFormData.treatment_details || '',
      follow_up_required: treatmentFormData.follow_up_required || false,
      vital_signs: vitalSigns,
      medications_administered: treatmentFormData.medications || '',
      procedures_performed: treatmentFormData.procedures_performed || '',
      doctor_assigned: treatmentFormData.doctor_assigned || '',
      nurse_assigned: treatmentFormData.nurse_assigned || '',
      follow_up_date: treatmentFormData.follow_up_date || null,
      follow_up_instructions: treatmentFormData.follow_up_instructions || '',
      emergency_contact_name: treatmentFormData.emergency_contact_name || '',
      emergency_contact_phone: treatmentFormData.emergency_contact_phone || '',
      insurance_provider: treatmentFormData.insurance_provider || '',
      insurance_policy_number: treatmentFormData.insurance_policy_number || '',
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/patient-treatments/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({
        open: true,
        message: 'Treatment form submitted successfully',
        severity: 'success',
      });
      handleCloseTreatmentForm();
    } catch (error) {
      console.error('Error submitting treatment form:', error);
      setSnackbar({
        open: true,
        message: 'Failed to submit treatment form',
        severity: 'error',
      });
    }
  };

  if (showResources) {
    return <ViewAllResources onGoBack={goBackToDashboard} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="static">
        <Toolbar>
          <HospitalIcon sx={{ mr: 2, color: 'red' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hospital Dashboard
          </Typography>
          <IconButton color="inherit">
            <BellIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: 'grey.300' }}>
            <UserIcon />
          </Avatar>
        </Toolbar>
      </AppBar>
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HospitalIcon sx={{ mr: 2, color: onDuty ? 'success.main' : 'text.secondary' }} />
            <Typography variant="h6">
              Hospital Status:{' '}
              <Typography component="span" color={onDuty ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 'bold' }}>
                {onDuty ? 'On Duty' : 'Off Duty'}
              </Typography>
            </Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={onDuty} onChange={handleDutyToggle} color="success" disabled={loading} />}
            label={loading ? 'Updating...' : ''}
          />
        </CardContent>
      </Card>

      {navigatingEmergency ? (
        <MapDetails emergency={navigatingEmergency} onClose={handleCloseMap} />
      ) : (
        <Container sx={{ py: 4 }}>
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Active Emergencies
                      </Typography>
                      <Typography variant="h4" color="error">
                        {activeEmergencies.length}
                      </Typography>
                    </Box>
                    <AlertCircleIcon color="error" fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Available Ambulances
                      </Typography>
                      <Typography variant="h4" color="success">
                        8
                      </Typography>
                    </Box>
                    <HospitalIcon color="success" fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Uber/Ola Partners
                      </Typography>
                      <Typography variant="h4" color="primary">
                        15
                      </Typography>
                    </Box>
                    <UsersIcon color="primary" fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Avg Response Time
                      </Typography>
                      <Typography variant="h4" color="secondary">
                        4.2m
                      </Typography>
                    </Box>
                    <ClockIcon color="secondary" fontSize="large" />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={6}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardHeader
                  title={
                    <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                      <AlertCircleIcon sx={{ mr: 2, color: 'red' }} />
                      Live Emergency Requests
                    </Typography>
                  }
                />
                <CardContent>
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Location</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {activeEmergencies.map((emergency) => (
                          <TableRow key={emergency.id}>
                            <TableCell>{emergency.start_location_name || 'N/A'}</TableCell>
                            <TableCell>{emergency.emergency_type || 'Unknown'}</TableCell>
                            <TableCell>{emergency.status}</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                color="primary"
                                startIcon={<NavigationIcon />}
                                onClick={() => handleNavigate(emergency)}
                                // disabled={!emergency.start_location?.lat || !emergency.start_location?.lng}
                                sx={{ mr: 1 }}
                              >
                                Navigate
                              </Button>
                              <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<EditIcon />}
                                onClick={() => handleOpenTreatmentForm(emergency)}
                              >
                                Fill Form
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ mt: 6 }}>
                <CardHeader
                  title={
                    <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                      <BarChartIcon sx={{ mr: 2 }} />
                      Response Time Analytics
                    </Typography>
                  }
                />
                <CardContent>
                  <Box
                    sx={{
                      height: 256,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'text.secondary',
                    }}
                  >
                    Response time chart will be displayed here
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card sx={{ mb: 4 }}>
                <CardHeader title="Quick Actions" />
                <CardContent>
                  <Button variant="contained" color="error" fullWidth startIcon={<PhoneIcon />} sx={{ mb: 2 }}>
                    Dispatch Ambulance
                  </Button>
                  <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }}>
                    Contact Traffic Police
                  </Button>
                  <Button variant="contained" fullWidth onClick={goToViewAllResources}>
                    View All Resources
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Available Resources" />
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                      <HospitalIcon sx={{ mr: 2, color: 'green' }} />
                      <Typography>Emergency Ambulances</Typography>
                    </Box>
                    <Typography variant="h6" color="green">
                      8
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center">
                      <UsersIcon sx={{ mr: 2, color: 'blue' }} />
                      <Typography>Uber/Ola Partners</Typography>
                    </Box>
                    <Typography variant="h6" color="blue">
                      15
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center">
                      <MapPinIcon sx={{ mr: 2, color: 'purple' }} />
                      <Typography>Coverage Area</Typography>
                    </Box>
                    <Typography variant="h6" color="purple">
                      5 km
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}

      {/* Enhanced Treatment Form Modal */}
      <Modal open={treatmentFormOpen} onClose={handleCloseTreatmentForm} aria-labelledby="treatment-form-title">
        <Paper sx={{ p: 4, maxWidth: 1000, mx: 'auto', mt: 5, maxHeight: '80vh', overflowY: 'auto' }}>
          <Typography id="treatment-form-title" variant="h6" component="h2">
            Fill Treatment Form for Emergency {selectedEmergency?.id}
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {/* Emergency Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle1">Emergency Details</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Emergency Type"
                fullWidth
                name="emergency_type"
                value={treatmentFormData.emergency_type}
                onChange={handleTreatmentFormChange}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Request Date & Time"
                type="datetime-local"
                fullWidth
                name="request_date"
                value={treatmentFormData.request_date}
                onChange={handleTreatmentFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Status"
                fullWidth
                name="status"
                value={treatmentFormData.status}
                onChange={handleTreatmentFormChange}
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Response Time (minutes)"
                type="number"
                fullWidth
                name="response_time"
                value={treatmentFormData.response_time}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Location"
                fullWidth
                name="location"
                value={treatmentFormData.location}
                onChange={handleTreatmentFormChange}
                disabled
              />
            </Grid>

            {/* Patient Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Patient Information</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Patient Name"
                fullWidth
                name="patient_name"
                value={treatmentFormData.patient_name}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Age"
                type="number"
                fullWidth
                name="patient_age"
                value={treatmentFormData.patient_age}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  label="Gender"
                  name="patient_gender"
                  value={treatmentFormData.patient_gender}
                  onChange={handleTreatmentFormChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Contact Number"
                fullWidth
                name="patient_contact"
                value={treatmentFormData.patient_contact}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Blood Type</InputLabel>
                <Select
                  label="Blood Type"
                  name="patient_blood_type"
                  value={treatmentFormData.patient_blood_type}
                  onChange={handleTreatmentFormChange}
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Allergies"
                multiline
                rows={2}
                fullWidth
                name="allergies"
                value={treatmentFormData.allergies}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography>Medical History</Typography>
              {selectedEmergency?.patient?.medical_histories?.length > 0 ? (
                selectedEmergency.patient.medical_histories.map((history, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography>{history.description || 'No description available'}</Typography>
                    {history.document_url && (
                      <a href={history.document_url} target="_blank" rel="noopener noreferrer">
                        View Document
                      </a>
                    )}
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No medical history available</Typography>
              )}
            </Grid>
            {/* Inside the Patient Information section of the Modal */}
            <Grid item xs={12}>
              <Typography variant="subtitle2">Patient Documents</Typography>
              {treatmentFormData.face_image_url && (
                <Box>
                  <Typography>Face Image:</Typography>
                  <a href={treatmentFormData.face_image_url} target="_blank" rel="noopener noreferrer">
                    View Face Image
                  </a>
                </Box>
              )}
              {treatmentFormData.insurance_document_url && (
                <Box sx={{ mt: 1 }}>
                  <Typography>Insurance Document:</Typography>
                  <a href={treatmentFormData.insurance_document_url} target="_blank" rel="noopener noreferrer">
                    View Insurance Document
                  </a>
                </Box>
              )}
            </Grid>

            {/* Vital Signs */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Vital Signs</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Blood Pressure (mmHg)"
                fullWidth
                name="vital_signs.blood_pressure"
                value={treatmentFormData.vital_signs?.blood_pressure || ''}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Heart Rate (bpm)"
                type="number"
                fullWidth
                name="vital_signs.heart_rate"
                value={treatmentFormData.vital_signs?.heart_rate || ''}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Respiratory Rate (breaths/min)"
                type="number"
                fullWidth
                name="vital_signs.respiratory_rate"
                value={treatmentFormData.vital_signs?.respiratory_rate || ''}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Temperature (°C)"
                type="number"
                fullWidth
                name="vital_signs.temperature"
                value={treatmentFormData.vital_signs?.temperature || ''}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Oxygen Saturation (%)"
                type="number"
                fullWidth
                name="vital_signs.oxygen_saturation"
                value={treatmentFormData.vital_signs?.oxygen_saturation || ''}
                onChange={handleTreatmentFormChange}
              />
            </Grid>

            {/* Treatment Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Treatment Details</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Admission Date & Time"
                type="datetime-local"
                fullWidth
                name="admission_date"
                value={treatmentFormData.admission_date}
                onChange={handleTreatmentFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Discharge Date & Time"
                type="datetime-local"
                fullWidth
                name="discharge_date"
                value={treatmentFormData.discharge_date}
                onChange={handleTreatmentFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Diagnosis"
                multiline
                rows={3}
                fullWidth
                name="diagnosis"
                value={treatmentFormData.diagnosis}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Treatment Details"
                multiline
                rows={3}
                fullWidth
                name="treatment_details"
                value={treatmentFormData.treatment_details}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Medications Administered"
                multiline
                rows={3}
                fullWidth
                name="medications"
                value={treatmentFormData.medications}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Procedures Performed"
                multiline
                rows={3}
                fullWidth
                name="procedures_performed"
                value={treatmentFormData.procedures_performed}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Doctor Assigned"
                fullWidth
                name="doctor_assigned"
                value={treatmentFormData.doctor_assigned}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Nurse Assigned"
                fullWidth
                name="nurse_assigned"
                value={treatmentFormData.nurse_assigned}
                onChange={handleTreatmentFormChange}
              />
            </Grid>

            {/* Follow-up Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Follow-up Details</Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={treatmentFormData.follow_up_required}
                    onChange={handleTreatmentFormChange}
                    name="follow_up_required"
                  />
                }
                label="Follow-up Required"
              />
            </Grid>
            {treatmentFormData.follow_up_required && (
              <>
                <Grid item xs={6}>
                  <TextField
                    label="Follow-up Date"
                    type="date"
                    fullWidth
                    name="follow_up_date"
                    value={treatmentFormData.follow_up_date}
                    onChange={handleTreatmentFormChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Follow-up Instructions"
                    multiline
                    rows={2}
                    fullWidth
                    name="follow_up_instructions"
                    value={treatmentFormData.follow_up_instructions}
                    onChange={handleTreatmentFormChange}
                  />
                </Grid>
              </>
            )}

            {/* Emergency Contact and Insurance */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Emergency Contact & Insurance</Typography>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Emergency Contact Name"
                fullWidth
                name="emergency_contact_name"
                value={treatmentFormData.emergency_contact_name}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Emergency Contact Phone"
                fullWidth
                name="emergency_contact_phone"
                value={treatmentFormData.emergency_contact_phone}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Insurance Provider"
                fullWidth
                name="insurance_provider"
                value={treatmentFormData.insurance_provider}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Insurance Policy Number"
                fullWidth
                name="insurance_policy_number"
                value={treatmentFormData.insurance_policy_number}
                onChange={handleTreatmentFormChange}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={handleCloseTreatmentForm} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmitTreatmentForm}>
              Submit
            </Button>
          </Box>
        </Paper>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HospitalDashboard;