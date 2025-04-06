import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import {
  Box, Button, Card, CardContent, CardHeader, Container, Modal, Table, TableBody,
  TableCell, TableHead, TableRow, Typography, AppBar, Toolbar, IconButton, Avatar,
  Switch, FormControlLabel, Snackbar, Alert, TextField, FormHelperText, InputLabel,
  Select, MenuItem, Grid, Divider, Paper, FormControl
} from '@mui/material';
import {
  Navigation as NavigationIcon, ReportProblem as AlertCircleIcon, Notifications as BellIcon,
  Person as UserIcon, LocalHospital as HospitalIcon, DirectionsCar as CarIcon, Upload as UploadIcon, Edit as EditIcon
} from '@mui/icons-material';
import MapDetails from './mapdetails';

const DriverDashboard = () => {
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [showEmergencyForm, setShowEmergencyForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [onDuty, setOnDuty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '', email: '', firstName: '', lastName: '', gender: '', address: '',
  });
  const [faceImageFile, setFaceImageFile] = useState(null);
  const [drivingLicenseFile, setDrivingLicenseFile] = useState(null);
  const [carInsuranceFile, setCarInsuranceFile] = useState(null);
  const [carRcFile, setCarRcFile] = useState(null);
  const [faceImageUrl, setFaceImageUrl] = useState(null);
  const [drivingLicenseUrl, setDrivingLicenseUrl] = useState(null);
  const [carInsuranceUrl, setCarInsuranceUrl] = useState(null);
  const [carRcUrl, setCarRcUrl] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);


  useEffect(() => {
    const fetchDriverStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/driver/status/', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setOnDuty(response.data.driver_active);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching driver status:', error);
        setLoading(false);
      }
    };

    fetchDriverStatus();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setDriverLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => {
          setLocationError(error.message);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleDutyToggle = async () => {
    try {
      setLoading(true);
      const newStatus = !onDuty;
      await axios.patch(
        'http://localhost:8000/api/driver/status/',
        { driver_active: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' } }
      );
      setOnDuty(newStatus);
      setSnackbar({ open: true, message: `You are now ${newStatus ? 'on duty' : 'off duty'}`, severity: 'success' });
    } catch (error) {
      console.error('Error updating duty status:', error);
      setSnackbar({ open: true, message: 'Failed to update status. Please try again.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    if (!onDuty) {
      setActiveEmergencies([]);
      return;
    }

    const fetchEmergencies = () => {
      axios
        .get('http://localhost:8000/api/emergency-requests/', {
          params: { status: 'created,in_progress' },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((response) => {
          const transformedEmergencies = response.data.map((emergency) => ({
            id: emergency.id,
            start_location: {
              lat: emergency.start_location_latitude,
              lng: emergency.start_location_longitude,
              name: emergency.start_location_name,
            },
            end_location: {
              lat: emergency.end_location_latitude,
              lng: emergency.end_location_longitude,
              name: emergency.end_location_name,
            },
            type: emergency.emergency_type,
            status: emergency.status,
            eta: emergency.eta || 'N/A',
          }));
          setActiveEmergencies(transformedEmergencies);
        })
        .catch((error) => {
          console.error('Error fetching active emergencies:', error);
        });
    };

    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 10000);
    return () => clearInterval(interval);
  }, [onDuty]);

  useEffect(() => {
    if (showProfileModal) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to access your profile.');
        return;
      }
      axios.get('http://localhost:8000/api/drivers/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          const data = response.data;
          console.log('Driver profile data:', data);  // Add this line
          setProfileData({
            username: data.username,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            gender: data.gender,
            address: data.address,
          });
          setFaceImageUrl(data.face_image_url);
          setDrivingLicenseUrl(data.driving_license_document_url);
          setCarInsuranceUrl(data.car_insurance_document_url);
          setCarRcUrl(data.car_rc_document_url);
          setFaceImageFile(null);
          setDrivingLicenseFile(null);
          setCarInsuranceFile(null);
          setCarRcFile(null);
          setCurrentPassword('');
          setNewPassword('');
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
          alert('Failed to load profile data. Please try again.');
        });
    }
  }, [showProfileModal]);

  const handleViewRoute = (trip) => {
    setSelectedTrip(trip);
    setShowMap(true);
  };

  const handleFaceImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file for the face image.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setFaceImageFile(file);
    }
  };

  const handleDrivingLicenseChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file for the driving license.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setDrivingLicenseFile(file);
    }
  };

  const handleCarInsuranceChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file for the car insurance.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setCarInsuranceFile(file);
    }
  };

  const handleCarRcChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file for the car RC.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setCarRcFile(file);
    }
  };

  const handleDeleteDocument = async (documentType) => {
    if (window.confirm(`Are you sure you want to delete the ${documentType.replace('_', ' ')}?`)) {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append(`delete_${documentType}`, 'true');
        await axios.put('http://localhost:8000/api/drivers/profile/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
        });
        if (documentType === 'face_image') setFaceImageUrl(null);
        if (documentType === 'driving_license_document') setDrivingLicenseUrl(null);
        if (documentType === 'car_insurance_document') setCarInsuranceUrl(null);
        if (documentType === 'car_rc_document') setCarRcUrl(null);
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document. Please try again.');
      }
    }
  };

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
    if (drivingLicenseFile) formData.append('driving_license_document', drivingLicenseFile);
    if (carInsuranceFile) formData.append('car_insurance_document', carInsuranceFile);
    if (carRcFile) formData.append('car_rc_document', carRcFile);
    if (currentPassword && newPassword) {
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
    } else if (currentPassword || newPassword) {
      alert('Please fill in both current and new password fields to change your password.');
      return;
    }

    axios.put('http://localhost:8000/api/drivers/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
    })
      .then(() => {
        alert('Profile updated successfully!');
        setFaceImageFile(null);
        setDrivingLicenseFile(null);
        setCarInsuranceFile(null);
        setCarRcFile(null);
        setCurrentPassword('');
        setNewPassword('');
        setShowProfileModal(false);
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        if (error.response && error.response.status === 401) {
          alert('Session expired. Please log in again.');
        } else {
          alert('Failed to update profile. Please try again.');
        }
      });
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
      <AppBar position="static" sx={{ bgcolor: 'primary.dark' }}>
        <Toolbar>
          <HospitalIcon sx={{ mr: 2, color: 'red' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            Driver Dashboard
          </Typography>
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
          <Avatar sx={{ bgcolor: 'secondary.main' }} onClick={() => setShowProfileModal(true)}>
            <UserIcon />
          </Avatar>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 6 }}>
        {locationError && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            Unable to access location: {locationError}. Please allow location access to view routes.
          </Typography>
        )}

        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CarIcon sx={{ mr: 2, color: onDuty ? 'success.main' : 'text.secondary' }} />
              <Typography variant="h6">
                Driver Status: <Typography component="span" color={onDuty ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 'bold' }}>
                  {onDuty ? 'On Duty' : 'Off Duty'}
                </Typography>
              </Typography>
            </Box>
            <FormControlLabel
              control={<Switch checked={onDuty} onChange={handleDutyToggle} color="success" disabled={loading} />}
              label={loading ? "Updating..." : ""}
            />
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <AlertCircleIcon sx={{ mr: 2, color: 'red' }} />
                Active Emergencies
              </Typography>
            }
          />
          <CardContent>
            {!onDuty ? (
              <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                You are currently off duty. Toggle your status to view active emergencies.
              </Typography>
            ) : activeEmergencies.length > 0 ? (
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>ETA</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeEmergencies.map((emergency) => (
                      <TableRow key={emergency.id}>
                        <TableCell>{emergency.start_location.name}</TableCell>
                        <TableCell>{emergency.type}</TableCell>
                        <TableCell>{emergency.eta}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<NavigationIcon />}
                            onClick={() => handleViewRoute(emergency)}
                            disabled={!driverLocation}
                            sx={{ borderRadius: 1 }}
                          >
                            View Route
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Typography variant="body1" sx={{ textAlign: 'center' }}>
                No active emergencies at the moment
              </Typography>
            )}
          </CardContent>
        </Card>
      </Container>

      <Modal open={showProfileModal} onClose={() => setShowProfileModal(false)} aria-labelledby="profile-form-title">
        <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 8, maxHeight: '80vh', overflow: 'auto' }}>
          <Typography id="profile-form-title" variant="h5" component="h2" gutterBottom>
            Update Your Profile
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {/* Personal Information */}
            <Grid item xs={12}>
              <Typography variant="h6" color="primary" gutterBottom>
                Personal Information
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

            {/* Driver Documents */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Driver Documents
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Face Image
              </Typography>
              {faceImageUrl && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <img src={faceImageUrl} alt="Current Face" style={{ maxWidth: '200px' }} />
                    <br />
                    <a href={faceImageUrl} target="_blank" rel="noopener noreferrer">View Current Face Image</a>
                  </Box>
                  <Button variant="outlined" color="error" onClick={() => handleDeleteDocument('face_image')}>
                    Delete Photo
                  </Button>
                </Box>
              )}
              <Box sx={{ border: '1px dashed', borderColor: 'grey.400', borderRadius: 1, p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
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
                    <Button component="span" variant="contained" startIcon={<UploadIcon />} sx={{ mb: 2 }}>
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
              <Typography variant="subtitle1" gutterBottom>
                Driving License Document
              </Typography>
              {drivingLicenseUrl && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a href={drivingLicenseUrl} target="_blank" rel="noopener noreferrer">View Current Driving License</a>
                  <Button variant="outlined" color="error" onClick={() => handleDeleteDocument('driving_license_document')}>
                    Delete Document
                  </Button>
                </Box>
              )}
              <Box sx={{ border: '1px dashed', borderColor: 'grey.400', borderRadius: 1, p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
                <input
                  type="file"
                  accept="application/pdf"
                  id="driving-license-upload"
                  style={{ display: 'none' }}
                  onChange={handleDrivingLicenseChange}
                />
                <label htmlFor="driving-license-upload">
                  <Button component="span" variant="contained" startIcon={<UploadIcon />} sx={{ mb: 2 }}>
                    Upload Driving License PDF
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  {drivingLicenseFile ? `Selected file: ${drivingLicenseFile.name}` : 'Drag and drop a PDF here'}
                </Typography>
                <FormHelperText>Accepted format: PDF only (Max size: 5MB)</FormHelperText>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Car Insurance Document
              </Typography>
              {carInsuranceUrl && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a href={carInsuranceUrl} target="_blank" rel="noopener noreferrer">View Current Car Insurance</a>
                  <Button variant="outlined" color="error" onClick={() => handleDeleteDocument('car_insurance_document')}>
                    Delete Document
                  </Button>
                </Box>
              )}
              <Box sx={{ border: '1px dashed', borderColor: 'grey.400', borderRadius: 1, p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
                <input
                  type="file"
                  accept="application/pdf"
                  id="car-insurance-upload"
                  style={{ display: 'none' }}
                  onChange={handleCarInsuranceChange}
                />
                <label htmlFor="car-insurance-upload">
                  <Button component="span" variant="contained" startIcon={<UploadIcon />} sx={{ mb: 2 }}>
                    Upload Car Insurance PDF
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  {carInsuranceFile ? `Selected file: ${carInsuranceFile.name}` : 'Drag and drop a PDF here'}
                </Typography>
                <FormHelperText>Accepted format: PDF only (Max size: 5MB)</FormHelperText>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Car RC Document
              </Typography>
              {carRcUrl && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a href={carRcUrl} target="_blank" rel="noopener noreferrer">View Current Car RC</a>
                  <Button variant="outlined" color="error" onClick={() => handleDeleteDocument('car_rc_document')}>
                    Delete Document
                  </Button>
                </Box>
              )}
              <Box sx={{ border: '1px dashed', borderColor: 'grey.400', borderRadius: 1, p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
                <input
                  type="file"
                  accept="application/pdf"
                  id="car-rc-upload"
                  style={{ display: 'none' }}
                  onChange={handleCarRcChange}
                />
                <label htmlFor="car-rc-upload">
                  <Button component="span" variant="contained" startIcon={<UploadIcon />} sx={{ mb: 2 }}>
                    Upload Car RC PDF
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  {carRcFile ? `Selected file: ${carRcFile.name}` : 'Drag and drop a PDF here'}
                </Typography>
                <FormHelperText>Accepted format: PDF only (Max size: 5MB)</FormHelperText>
              </Box>
            </Grid>

            {/* Password Change */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Change Password
              </Typography>
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

      <Modal open={showMap} onClose={() => setShowMap(false)}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 800, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
          {driverLocation && selectedTrip ? (
            <MapDetails
              start={driverLocation}
              end={selectedTrip.end_location}
              waypoints={[selectedTrip.start_location]}
              onClose={() => setShowMap(false)}
            />
          ) : (
            <Typography>Unable to display map. Location data is missing.</Typography>
          )}
        </Box>
      </Modal>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DriverDashboard;