import React, { useState, useEffect } from 'react';
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
  FormControlLabel,
  Switch,
  Snackbar,
  Alert,
  Modal,
  Paper,
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import {
  Notifications as BellIcon,
  Person as UserIcon,
  Directions as NavigationIcon,
  Shield as ShieldIcon,
  BarChart as BarChartIcon,
  ReportProblem as AlertCircleIcon,
  Map as MapIcon,
  AccessTime as ClockIcon,
  LocalPolice as PoliceIcon,
  Edit as EditIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import axios from 'axios';
import MapDetails from './mapdetails';

const PoliceDashboard = () => {
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [navigatingEmergency, setNavigatingEmergency] = useState(null);
  const [onDuty, setOnDuty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '', email: '', firstName: '', lastName: '', gender: '', address: '',
    rank: '', stationName: '', latitude: '', longitude: '',
  });
  const [badgeDocumentFile, setBadgeDocumentFile] = useState(null);
  const [badgeDocumentUrl, setBadgeDocumentUrl] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchPoliceStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/police/status/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setOnDuty(response.data.police_active);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching police status:', error);
        setLoading(false);
      }
    };

    fetchPoliceStatus();
  }, []);

  useEffect(() => {
    const fetchEmergencies = () => {
      axios
        .get('http://localhost:8000/api/emergency-requests/', {
          params: { status: 'created,in_progress' },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        .then(response => {
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
            type: emergency.emergency_type,
            status: emergency.status,
            eta: emergency.eta || 'N/A'
          }));
          setActiveEmergencies(transformedEmergencies);
        })
        .catch(error => {
          console.error('Error fetching active emergencies:', error);
        });
    };
    fetchEmergencies();
    const interval = setInterval(fetchEmergencies, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showProfileModal) {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to access your profile.');
        return;
      }
      axios.get('http://localhost:8000/api/police/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          const data = response.data;
          setProfileData({
            username: data.username,
            email: data.email,
            firstName: data.first_name,
            lastName: data.last_name,
            gender: data.gender,
            address: data.address,
            rank: data.rank,
            stationName: data.station_name,
            latitude: data.latitude,
            longitude: data.longitude,
          });
          setBadgeDocumentUrl(data.badge_document_url);
          setBadgeDocumentFile(null);
          setCurrentPassword('');
          setNewPassword('');
        })
        .catch(error => {
          console.error('Error fetching profile:', error);
          alert('Failed to load profile data. Please try again.');
        });
    }
  }, [showProfileModal]);

  const handleDutyToggle = async () => {
    try {
      setLoading(true);
      const newStatus = !onDuty;
      const response = await axios.patch(
        'http://localhost:8000/api/police/status/',
        { police_active: newStatus },
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
    setNavigatingEmergency(emergency);
  };

  const handleCloseMap = () => {
    setNavigatingEmergency(null);
  };

  const handleBadgeDocumentChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file for the badge document.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      setBadgeDocumentFile(file);
    }
  };

  const handleDeleteDocument = async () => {
    if (window.confirm('Are you sure you want to delete the badge document?')) {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('delete_badge_document', 'true');
        await axios.put('http://localhost:8000/api/police/profile/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          },
        });
        setBadgeDocumentUrl(null);
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
    formData.append('first_name', profileData.firstName);  // Fix field name
    formData.append('last_name', profileData.lastName);    // Fix field name
    formData.append('gender', profileData.gender);
    formData.append('rank', profileData.rank);
    formData.append('station_name', profileData.stationName);

    // // Validate latitude and longitude
    // if (profileData.latitude !== '' && !isNaN(profileData.latitude)) {
    //   formData.append('latitude', profileData.latitude);
    // }
    // if (profileData.longitude !== '' && !isNaN(profileData.longitude)) {
    //   formData.append('longitude', profileData.longitude);
    // }
    if (badgeDocumentFile) formData.append('badge_document', badgeDocumentFile);
    if (currentPassword && newPassword) {
      formData.append('currentPassword', currentPassword);
      formData.append('newPassword', newPassword);
    } else if (currentPassword || newPassword) {
      alert('Please fill in both current and new password fields to change your password.');
      return;
    }

    axios.put('http://localhost:8000/api/police/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      },
    })
      .then(() => {
        alert('Profile updated successfully!');
        setBadgeDocumentFile(null);
        setCurrentPassword('');
        setNewPassword('');
        setShowProfileModal(false);
      })
      .catch(error => {
        console.error('Error updating profile:', error);
        if (error.response) {
          // console.log('Validation errors:', error.response.data);
          let errorMessage = 'Please correct the following errors:\n';
          for (const [field, messages] of Object.entries(error.response.data)) {
            errorMessage += `${field}: ${messages.join(', ')}\n`;
          }
          alert(errorMessage);
        } else {
          alert('Failed to update profile. Please try again.');
        }
      });
  };
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
      <AppBar position="static">
        <Toolbar>
          <ShieldIcon sx={{ mr: 2, color: 'blue' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Police Dashboard
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
          <Avatar sx={{ bgcolor: 'grey.300' }}>
            <UserIcon />
          </Avatar>
        </Toolbar>
      </AppBar>
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PoliceIcon sx={{ mr: 2, color: onDuty ? 'success.main' : 'text.secondary' }} />
            <Typography variant="h6">
              Police Status: <Typography component="span" color={onDuty ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 'bold' }}>
                {onDuty ? 'On Duty' : 'Off Duty'}
              </Typography>
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={onDuty}
                onChange={handleDutyToggle}
                color="success"
                disabled={loading}
              />
            }
            label={loading ? "Updating..." : ""}
          />
        </CardContent>
      </Card>

      <Container sx={{ py: 6 }}>
        {navigatingEmergency ? (
          <MapDetails emergency={navigatingEmergency} onClose={handleCloseMap} />
        ) : (
          <>
            <Grid container spacing={4} mb={6}>
              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="textSecondary">Active Emergencies</Typography>
                        <Typography variant="h4" color="error">{activeEmergencies.length}</Typography>
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
                        <Typography variant="body2" color="textSecondary">Available Officers</Typography>
                        <Typography variant="h4" color="success">8</Typography>
                      </Box>
                      <ShieldIcon color="success" fontSize="large" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="textSecondary">Patrol Vehicles</Typography>
                        <Typography variant="h4" color="primary">15</Typography>
                      </Box>
                      <MapIcon color="primary" fontSize="large" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6} lg={3}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="textSecondary">Avg Response Time</Typography>
                        <Typography variant="h4" color="secondary">4.2m</Typography>
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
                              <TableCell>{emergency.start_location.name}</TableCell>
                              <TableCell>{emergency.type}</TableCell>
                              <TableCell>{emergency.status}</TableCell>
                              <TableCell>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  startIcon={<NavigationIcon />}
                                  sx={{ mt: 1 }}
                                  onClick={() => handleNavigate(emergency)}
                                >
                                  Navigate
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
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

            {/* Police Information */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Police Information
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Rank"
                value={profileData.rank}
                onChange={(e) => setProfileData({ ...profileData, rank: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Station Name"
                value={profileData.stationName}
                onChange={(e) => setProfileData({ ...profileData, stationName: e.target.value })}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Latitude"
                value={profileData.latitude}
                onChange={(e) => setProfileData({ ...profileData, latitude: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Longitude"
                value={profileData.longitude}
                onChange={(e) => setProfileData({ ...profileData, longitude: e.target.value })}
              />
            </Grid> */}

            {/* Badge Document */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Badge Document
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {badgeDocumentUrl && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <a href={badgeDocumentUrl} target="_blank" rel="noopener noreferrer">View Current Badge Document</a>
                  <Button variant="outlined" color="error" onClick={handleDeleteDocument}>
                    Delete Document
                  </Button>
                </Box>
              )}
              <Box sx={{ border: '1px dashed', borderColor: 'grey.400', borderRadius: 1, p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
                <input
                  type="file"
                  accept="application/pdf"
                  id="badge-document-upload"
                  style={{ display: 'none' }}
                  onChange={handleBadgeDocumentChange}
                />
                <label htmlFor="badge-document-upload">
                  <Button component="span" variant="contained" startIcon={<UploadIcon />} sx={{ mb: 2 }}>
                    Upload Badge Document PDF
                  </Button>
                </label>
                <Typography variant="body2" color="text.secondary">
                  {badgeDocumentFile ? `Selected file: ${badgeDocumentFile.name}` : 'Drag and drop a PDF here'}
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

export default PoliceDashboard;