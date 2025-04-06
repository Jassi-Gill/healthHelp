import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  Grid,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Modal,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Input,
  FormHelperText,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Notifications as BellIcon,
  Person as UserIcon,
  Phone as PhoneIcon,
  AccessTime as ClockIcon,
  LocationOn as MapPinIcon,
  History as HistoryIcon,
  LocalHospital as HospitalIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { StandaloneSearchBox } from '@react-google-maps/api';
import axios from 'axios';
import EmergencyDetailsModal from './emergencyDetailsModal';
import EmergencyAmbulanceCalling from './emergencyAmbulanceCalling';

const PatientDashboard = ({ goBack }) => {
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showEmergencyDetails, setShowEmergencyDetails] = useState(false);
  const [showEmergencyCalling, setShowEmergencyCalling] = useState(false);
  const [startSearchBox, setStartSearchBox] = useState(null);
  const [destinationSearchBox, setDestinationSearchBox] = useState(null);
  const [startLocation, setStartLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  const [emergencyRequest, setEmergencyRequest] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false); // For photo capture
  const [photo, setPhoto] = useState(null); // For storing captured photo
  const [isForCurrentUser, setIsForCurrentUser] = useState(true); // New state for checkbox
  const webcamRef = useRef(null);



  // New state for profile update modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    username: 'JohnDoe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'Male',
    address: '123 Main St, Anytown, USA',
  });
  const [insuranceFile, setInsuranceFile] = useState(null);
  const [currentInsurance, setCurrentInsurance] = useState('insurance_policy.pdf');
  const [faceImageFile, setFaceImageFile] = useState(null);
  const [medicalHistoryEntries, setMedicalHistoryEntries] = useState([{ description: '', file: null }]);
  const [faceImageUrl, setFaceImageUrl] = useState(null);
  const [insuranceDocumentUrl, setInsuranceDocumentUrl] = useState(null);
  const [existingMedicalHistory, setExistingMedicalHistory] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);

  const [nearbyHospitals, setNearbyHospitals] = useState([]);

  // Changed emergencyHistory to state
  const [emergencyHistory, setEmergencyHistory] = useState([
    {
      id: 1,
      date: '2025-02-08',
      type: 'Medical Emergency',
      response: 'Uber Driver',
      status: 'Completed',
      duration: '15 mins'
    },
    {
      id: 2,
      date: '2025-02-01',
      type: 'Accident',
      response: 'Ambulance',
      status: 'Completed',
      duration: '12 mins'
    }
  ]);

  useEffect(() => {
    if (showEmergencyForm && startLocation) {
      const fetchNearbyHospitals = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            alert('Please log in to access nearby hospitals.');
            return;
          }

          const response = await axios.get('http://localhost:8000/api/nearby-hospitals/', {
            params: {
              lat: startLocation.lat,
              lon: startLocation.lng
            },
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          console.log(response.data.message)
          if (response.data.message === "No") {
            setNearbyHospitals([]);
          } else {
            setNearbyHospitals(response.data);
          }
        } catch (error) {
          console.error('Error fetching nearby hospitals:', error);
          alert('Failed to fetch nearby hospitals. Please try manually selecting a destination.');
        }
      };
      fetchNearbyHospitals();
    }
  }, [showEmergencyForm, startLocation]);

  useEffect(() => {
    if (showEmergencyForm) {
      const style = document.createElement('style');
      style.textContent = '.pac-container { z-index: 1400 !important; }';
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [showEmergencyForm]);


  useEffect(() => {
    if (showProfileModal) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to access your profile.');
        return;
      }
      axios.get('http://localhost:8000/api/patients/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(response => {
          const data = response.data;
          setProfileData({
            username: data.username,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            gender: data.gender,
            address: data.address
          });
          setFaceImageUrl(data.face_image_url);
          setInsuranceDocumentUrl(data.insurance_document_url);
          setExistingMedicalHistory(data.medical_histories);  // Changed from medical_history to medical_histories
          setFaceImageFile(null);
          setInsuranceFile(null);
          setCurrentPassword('');
          setNewPassword('');
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
          alert('Failed to load profile data. Please try again.');
        });
    }
  }, [showProfileModal]);


  // Handle clicking an emergency history entry
  const handleEmergencyClick = (emergency) => {
    setSelectedEmergency(emergency);
    setShowEmergencyDetails(true);
  };

  // Load handlers for search boxes
  const onStartLoad = (ref) => setStartSearchBox(ref);
  const onDestinationLoad = (ref) => setDestinationSearchBox(ref);

  // Handle place selection for start location
  const onStartPlacesChanged = () => {
    if (startSearchBox) {
      const places = startSearchBox.getPlaces();
      if (places.length > 0) {
        const place = places[0];
        setStartLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          name: place.formatted_address
        });
      }
    }
  };

  // Handle place selection for destination
  const onDestinationPlacesChanged = () => {
    if (destinationSearchBox) {
      const places = destinationSearchBox.getPlaces();
      if (places.length > 0) {
        const place = places[0];
        setDestinationLocation({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          name: place.formatted_address
        });
      }
    }
  };

  // Handle "Use Current Location" button
  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setLoadingCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode(
            { location: { lat: position.coords.latitude, lng: position.coords.longitude } },
            (results, status) => {
              if (status === 'OK' && results[0]) {
                setStartLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  name: results[0].formatted_address
                });
              } else {
                setStartLocation({
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                  name: 'Current Location'
                });
              }
              setLoadingCurrentLocation(false);
            }
          );
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Unable to fetch current location. Please ensure location services are enabled.');
          setLoadingCurrentLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };


  // Convert base64 to Blob
  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  // Handle emergency call request
  const handleEmergencyCallRequest = async (type) => {
    if (!startLocation || !destinationLocation) {
      alert('Please select both start and destination locations.');
      return;
    }

    // Require photo only if the request is for the current user
    // if (isForCurrentUser && !photo) {
    //   alert('Please capture a photo for verification.');
    //   return;
    // }

    const formData = new FormData();
    if (photo) {
      formData.append('photo', base64ToBlob(photo));
    }
    formData.append('start_location_latitude', startLocation.lat);
    formData.append('start_location_longitude', startLocation.lng);
    formData.append('start_location_name', startLocation.name);
    formData.append('end_location_latitude', destinationLocation.lat);
    formData.append('end_location_longitude', destinationLocation.lng);
    formData.append('end_location_name', destinationLocation.name);
    formData.append('emergency_type', type);

    try {
      const response = await axios.post(
        'http://localhost:8000/api/emergency-requests/',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setShowEmergencyForm(false);
      setShowEmergencyCalling(true);
      setStartLocation(null);
      setDestinationLocation(null);
      setEmergencyRequest(response.data);
      setPhoto(null); // Reset photo after successful request
    } catch (error) {
      console.error('Error requesting emergency service:', error);
      if (error.response) {
        alert('Error: ' + (error.response.data.error || 'Failed to process request'));
      } else {
        alert('Network error. Please check your connection.');
      }
    }
  };

  // Close emergency calling dialog
  const handleCloseEmergencyCalling = () => {
    setShowEmergencyCalling(false);
  };

  // Callback to handle call end and update history
  const handleCallEnded = (emergency) => {
    setEmergencyHistory(prev => [...prev, {
      id: prev.length + 1,
      date: new Date().toISOString().split('T')[0],
      type: emergency.emergency_type === 'critical' ? 'Critical Emergency' : 'Non-Critical Emergency',
      response: 'Ambulance',
      status: 'Completed',
      duration: 'Unknown'
    }]);
  };

  const handleVerificationClose = () => {
    setShowVerificationModal(false);
    setPhoto(null);
  };

  // Proceed to emergency form after capturing photo
  const proceedToEmergencyForm = () => {
    if (isForCurrentUser && !photo) {
      alert('Please capture a photo before proceeding.');
      return;
    }
    setShowVerificationModal(false);
    setShowEmergencyForm(true);
  };

  // Handle profile data change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  // Handle face image file upload
  const handleFaceImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file for the user photo.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setFaceImageFile(file);
    }
  };

  const handleDeleteFaceImage = async () => {
    if (window.confirm('Are you sure you want to delete the face image?')) {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('delete_face_image', 'true');
        await axios.put('http://localhost:8000/api/patients/profile/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });
        setFaceImageUrl(null);
        setFaceImageFile(null);
      } catch (error) {
        console.error('Error deleting face image:', error);
        alert('Failed to delete face image. Please try again.');
      }
    }
  };

  // Handle insurance file upload
  const handleInsuranceFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file for insurance documents.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setInsuranceFile(file);
    }
  };

  // Handle medical history change
  const handleMedicalHistoryChange = (index, field, value) => {
    const newEntries = [...medicalHistoryEntries];
    newEntries[index][field] = value;
    setMedicalHistoryEntries(newEntries);
  };

  // Add new medical history entry
  const addMedicalHistoryEntry = () => {
    setMedicalHistoryEntries([...medicalHistoryEntries, { description: '', file: null }]);
  };

  const handleDeleteMedicalHistory = async (id) => {
    if (window.confirm('Are you sure you want to delete this medical history entry?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8000/api/medical-histories/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setExistingMedicalHistory(existingMedicalHistory.filter(entry => entry.id !== id));
      } catch (error) {
        console.error('Error deleting medical history:', error);
        alert('Failed to delete medical history. Please try again.');
      }
    }
  };

  // Handle profile update submission
  const handleProfileUpdate = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to update your profile.');
      return;
    }
    const formData = new FormData();
    formData.append('username', profileData.username);
    formData.append('email', profileData.email);
    formData.append('first_name', profileData.firstName);
    formData.append('last_name', profileData.lastName);
    formData.append('gender', profileData.gender);
    formData.append('address', profileData.address);
    if (faceImageFile) formData.append('face_image', faceImageFile);
    if (insuranceFile) formData.append('insurance_document', insuranceFile);
    if (currentPassword && newPassword) {
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
    }
    else if (currentPassword || newPassword) {
      alert('Please fill in both current and new password fields to change your password.');
      return;
    }
    medicalHistoryEntries.forEach((entry, index) => {
      if (entry.description || entry.file) {
        formData.append(`medical_history_description_${index}`, entry.description);
        if (entry.file) {
          formData.append(`medical_history_file_${index}`, entry.file);
        }
      }
    });

    axios.put('http://localhost:8000/api/patients/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    })
      .then(() => {
        alert('Profile updated successfully!');
        if (insuranceFile) {
          setCurrentInsurance(insuranceFile.name);
        }
        setFaceImageFile(null);
        setInsuranceFile(null);
        setMedicalHistoryEntries([{ description: '', file: null }]);
        setCurrentPassword('');
        setNewPassword('');
        setShowProfileModal(false);
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        if (error.response) {
          if (error.response.status === 401) {
            alert('Session expired. Please log in again.');
          } else if (error.response.data && error.response.data.error) {
            alert(error.response.data.error);
          } else {
            alert('Failed to update profile. Please try again.');
          }
        } else {
          alert('Network error. Please check your connection.');
        }
      });
  };

  const handleInsuranceChange = (e) => setInsuranceFile(e.target.files[0]);

  const handleDeleteInsuranceDocument = async () => {
    if (window.confirm('Are you sure you want to delete the insurance document?')) {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('delete_insurance_document', 'true');
        await axios.put('http://localhost:8000/api/patients/profile/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });
        setInsuranceDocumentUrl(null);
        setCurrentInsurance(null);
      } catch (error) {
        console.error('Error deleting insurance document:', error);
        alert('Failed to delete insurance document. Please try again.');
      }
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'webcam_photo.jpg', { type: 'image/jpeg' });
        setFaceImageFile(file);
        setShowWebcam(false);
      });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      {/* Top Navigation */}
      <AppBar position="static">
        <Toolbar>
          <HospitalIcon sx={{ mr: 2, color: 'red' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Emergency Response System
          </Typography>
          {goBack && (
            <Button color="inherit" onClick={goBack}>
              Back to Login
            </Button>
          )}
          {/* Update Profile Button */}
          <Button
            color="inherit"
            startIcon={<EditIcon />}
            onClick={() => setShowProfileModal(true)}
            sx={{ mr: 2 }}
          >
            Update Profile
          </Button>
          <IconButton color="inherit">
            <BellIcon />
          </IconButton>
          <Avatar sx={{ bgcolor: 'grey.300' }}>
            <UserIcon />
          </Avatar>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container sx={{ py: 6 }}>
        {/* Emergency Button */}
        <Box mb={8}>
          <Button
            fullWidth
            variant="contained"
            color="error"
            size="large"
            startIcon={<PhoneIcon />}
            onClick={() => setShowEmergencyForm(true)}
          >
            Call Emergency Ambulance
          </Button>
        </Box>

        {/* Emergency Form Modal */}
        <Modal
          open={showEmergencyForm}
          onClose={() => setShowEmergencyForm(false)}
          aria-labelledby="emergency-form-title"
          aria-describedby="emergency-form-description"
        >
          <Paper sx={{
            p: 4,
            maxWidth: 600,
            mx: 'auto',
            mt: 10,
            position: 'relative',
            zIndex: 1301 // Ensure modal content is above backdrop
          }}>
            <Typography id="emergency-form-title" variant="h6" component="h2">
              Request Emergency Service
            </Typography>
            <Box mt={2}>
              <Typography variant="subtitle1">Start Location</Typography>
              <Box display="flex" alignItems="center">
                <StandaloneSearchBox onLoad={onStartLoad} onPlacesChanged={onStartPlacesChanged}>
                  <input
                    type="text"
                    placeholder="Enter start location"
                    style={{
                      width: '100%',
                      padding: '10px',
                      boxSizing: 'border-box',
                      zIndex: 1400 // Ensure input is above other elements
                    }}
                  />
                </StandaloneSearchBox>
                <Button
                  variant="outlined"
                  onClick={handleUseCurrentLocation}
                  disabled={loadingCurrentLocation}
                  sx={{ ml: 2, whiteSpace: 'nowrap' }}
                >
                  {loadingCurrentLocation ? 'Loading...' : 'Use Current Location'}
                </Button>
              </Box>
              {startLocation && <Typography mt={1}>Selected: {startLocation.name}</Typography>}

              <Box mt={2}>
                <Typography variant="subtitle1">Nearby Hospitals</Typography>
                {startLocation ? (
                  nearbyHospitals.length > 0 ? (
                    <Box sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                      <List>
                        {nearbyHospitals.map((hospital) => (
                          <ListItem
                            button
                            key={hospital.id}
                            onClick={() => setDestinationLocation({
                              lat: hospital.latitude,
                              lng: hospital.longitude,
                              name: hospital.name,
                            })}
                            sx={{
                              backgroundColor: destinationLocation && destinationLocation.name === hospital.name ? 'grey.200' : 'inherit',
                              borderRadius: 1,
                              mb: 1,
                            }}
                          >
                            <ListItemText
                              primary={hospital.name}
                              secondary={`${hospital.address} - ${hospital.distance} km`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No nearby hospitals found within 10 km.
                    </Typography>
                  )
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Please select a start location first.
                  </Typography>
                )}
              </Box>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>Manual Destination</Typography>
              <StandaloneSearchBox onLoad={onDestinationLoad} onPlacesChanged={onDestinationPlacesChanged}>
                <input
                  type="text"
                  placeholder="Enter destination manually"
                  style={{
                    width: '100%',
                    padding: '10px',
                    boxSizing: 'border-box',
                    zIndex: 1400
                  }}
                />
              </StandaloneSearchBox>
              {destinationLocation && <Typography mt={1}>Selected: {destinationLocation.name}</Typography>}
              {/* Checkbox for current user or other */}
              {/* <FormControlLabel
                control={
                  <Checkbox
                    checked={isForCurrentUser}
                    onChange={(e) => setIsForCurrentUser(e.target.checked)}
                    color="primary"
                  />
                }
                label="This request is for me"
                sx={{ mt: 2 }}
              /> */}

              {/* Webcam for photo capture (only if for current user) */}
              {/* {isForCurrentUser && (
                <Box mt={2}>
                  <Typography variant="subtitle1">Verify Your Identity</Typography>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width="100%"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={capturePhoto}
                    sx={{ mt: 2 }}
                  >
                    Capture Photo
                  </Button>
                  {photo && (
                    <Box mt={2}>
                      <img src={photo} alt="Captured" style={{ width: '100%' }} />
                    </Box>
                  )}
                </Box>
              )} */}

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    onClick={() => handleEmergencyCallRequest('critical')}
                    disabled={!startLocation || !destinationLocation}
                  >
                    Critical Emergency
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="warning"
                    onClick={() => handleEmergencyCallRequest('non-critical')}
                    disabled={!startLocation || !destinationLocation}
                  >
                    Non-Critical Emergency
                  </Button>
                </Grid>
              </Grid>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => setShowEmergencyForm(false)}
              >
                Cancel
              </Button>
            </Box>
          </Paper>
        </Modal>

        {/* Profile Update Modal */}
        <Modal
          open={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          aria-labelledby="profile-form-title"
        >
          <Paper sx={{
            p: 4,
            maxWidth: 800,
            mx: 'auto',
            mt: 8,
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <Typography id="profile-form-title" variant="h5" component="h2" gutterBottom>
              Update Your Profile
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              {/* Account Information */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Account Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Username"
                  value={profileData.username}
                  onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    value={profileData.gender || ''}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                    label="Gender"
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Grid>

              {/* Medical Information */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Medical Information
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  User Photo
                </Typography>
                {faceImageUrl && (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <img src={faceImageUrl} alt="Current Face" style={{ maxWidth: '200px' }} />
                      <br />
                      <a href={faceImageUrl} target="_blank" rel="noopener noreferrer">
                        View Current Face Image
                      </a>
                    </Box>
                    <Button variant="outlined" color="error" onClick={handleDeleteFaceImage}>
                      Delete Photo
                    </Button>
                  </Box>
                )}
                <Box
                  sx={{
                    border: '1px dashed',
                    borderColor: 'grey.400',
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: 'grey.50'
                  }}
                >
                  {showWebcam ? (
                    <>
                      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width="100%" />
                      <Button onClick={capturePhoto} sx={{ mt: 2 }}>Capture Photo</Button>
                    </>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      id="face-image-upload"
                      style={{ display: 'none' }}
                      onChange={handleFaceImageChange}
                    />
                  )}
                  <label htmlFor="face-image-upload">
                    {!showWebcam && (
                      <Button
                        component="span"
                        variant="contained"
                        startIcon={<UploadIcon />}
                        sx={{ mb: 2 }}
                      >
                        {faceImageUrl ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                    )}
                  </label>
                  <Button onClick={() => setShowWebcam(!showWebcam)}>
                    {showWebcam ? 'Use File Upload' : 'Use Webcam'}
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {faceImageFile ? `Selected file: ${faceImageFile.name}` : 'Drag and drop an image or use webcam'}
                  </Typography>
                  <FormHelperText>Accepted formats: JPEG, PNG (Max size: 5MB)</FormHelperText>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>
                  Medical History
                </Typography>
                {existingMedicalHistory.map((entry, index) => (
                  <Box key={entry.id} sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography>{entry.description}</Typography>
                      {entry.document_url && (
                        <a href={entry.document_url} target="_blank" rel="noopener noreferrer">
                          View Document
                        </a>
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteMedicalHistory(entry.id)}
                    >
                      Delete
                    </Button>
                  </Box>
                ))}
                {medicalHistoryEntries.map((entry, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label={`Medical History Description ${index + 1}`}
                      multiline
                      rows={4}
                      value={entry.description}
                      onChange={(e) => handleMedicalHistoryChange(index, 'description', e.target.value)}
                    />
                    <Box
                      sx={{
                        border: '1px dashed',
                        borderColor: 'grey.400',
                        borderRadius: 1,
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: 'grey.50',
                        mt: 2
                      }}
                    >
                      <input
                        type="file"
                        accept="application/pdf"
                        id={`medical-history-file-${index}`}
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            if (file.type !== 'application/pdf') {
                              alert('Please upload a PDF file.');
                              return;
                            }
                            if (file.size > 5 * 1024 * 1024) {
                              alert('File size exceeds 5MB limit.');
                              return;
                            }
                            handleMedicalHistoryChange(index, 'file', file);
                          }
                        }}
                      />
                      <label htmlFor={`medical-history-file-${index}`}>
                        <Button
                          component="span"
                          variant="contained"
                          startIcon={<UploadIcon />}
                          sx={{ mb: 2 }}
                        >
                          Upload PDF
                        </Button>
                      </label>
                      <Typography variant="body2" color="text.secondary">
                        {entry.file ? `Selected file: ${entry.file.name}` : 'Drag and drop a PDF here'}
                      </Typography>
                      <FormHelperText>Accepted format: PDF only (Max size: 5MB)</FormHelperText>
                    </Box>
                  </Box>
                ))}
                <Button onClick={addMedicalHistoryEntry} sx={{ mt: 2 }}>
                  Add Another Medical History Entry
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Insurance Document
                </Typography>
                {insuranceDocumentUrl && (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <a href={insuranceDocumentUrl} target="_blank" rel="noopener noreferrer">
                      View Current Insurance Document
                    </a>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDeleteInsuranceDocument}
                    >
                      Delete Insurance Document
                    </Button>
                  </Box>
                )}
                <Box
                  sx={{
                    border: '1px dashed',
                    borderColor: 'grey.400',
                    borderRadius: 1,
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: 'grey.50'
                  }}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    id="insurance-file-upload"
                    style={{ display: 'none' }}
                    onChange={handleInsuranceChange}
                  />
                  <label htmlFor="insurance-file-upload">
                    <Button
                      component="span"
                      variant="contained"
                      startIcon={<UploadIcon />}
                      sx={{ mb: 2 }}
                    >
                      Upload Insurance PDF
                    </Button>
                  </label>
                  <Typography variant="body2" color="text.secondary">
                    {insuranceFile ? `Selected file: ${insuranceFile.name}` : 'Drag and drop a PDF here'}
                  </Typography>
                  <FormHelperText>Accepted format: PDF only (Max size: 5MB)</FormHelperText>
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ mt: 3 }}>
                <Box display="flex" justifyContent="flex-end" gap={2}>
                  <Button variant="outlined" onClick={() => setShowProfileModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleProfileUpdate}>
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Modal>

        {/* Dashboard Grid */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Emergency Response Time" />
              <CardContent>
                <Typography variant="h3" color="success.main">
                  &lt; 5 mins
                </Typography>
                <Typography color="textSecondary">
                  Average response time in your area
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Available Services" />
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography>Ambulances Nearby</Typography>
                  <Typography variant="h6" color="success.main">4</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography>Uber/Ola Partners</Typography>
                  <Typography variant="h6" color="success.main">12</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Medical Profile" />
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <UserIcon sx={{ mr: 2, color: 'grey.500' }} />
                  <Typography>Blood Type: O+</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <CalendarIcon sx={{ mr: 2, color: 'grey.500' }} />
                  <Typography>Last Emergency: 7 days ago</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Emergency History */}
        <Card sx={{ mt: 6 }}>
          <CardHeader
            title={
              <Box display="flex" alignItems="center">
                <HistoryIcon sx={{ mr: 2 }} />
                Emergency History
              </Box>
            }
          />
          <CardContent>
            <Box sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Response</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Duration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emergencyHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>{history.date}</TableCell>
                      <TableCell>{history.type}</TableCell>
                      <TableCell>{history.response}</TableCell>
                      <TableCell>
                        <Box
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 'success.light',
                            color: 'success.dark',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'success.main', color: 'white' }
                          }}
                          onClick={() => handleEmergencyClick(history)}
                        >
                          {history.status}
                        </Box>
                      </TableCell>
                      <TableCell>{history.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Emergency Details Modal */}
      <EmergencyDetailsModal
        open={showEmergencyDetails}
        onClose={() => setShowEmergencyDetails(false)}
        emergency={selectedEmergency}
      />

      {showEmergencyCalling && (
        <EmergencyAmbulanceCalling
          onClose={handleCloseEmergencyCalling}
          onEndCall={handleCallEnded}
          emergencyRequest={emergencyRequest}
        />
      )}
    </Box>
  );
};

export default PatientDashboard;