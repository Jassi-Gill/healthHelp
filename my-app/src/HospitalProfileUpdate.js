import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import axios from 'axios';

const HospitalProfileUpdate = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/users/me');
                setFormData({
                    email: response.data.email || '',
                    gender: response.data.gender || '',
                    name: response.data.name || '',
                    address: response.data.address || '',
                    phone: response.data.phone || '',
                    capacity: response.data.capacity || '',
                    emergency_capacity: response.data.emergency_capacity || '',
                    hospital_email: response.data.hospital_email || '',
                });
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch user data');
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.put('http://localhost:8000/api/users/me', formData);
            alert('Profile updated successfully');
        } catch (err) {
            alert('Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
    if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Update Hospital Profile
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        type="email"
                    />
                    <TextField
                        label="Gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Hospital Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        multiline
                        rows={2}
                    />
                    <TextField
                        label="Phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        type="tel"
                    />
                    <TextField
                        label="Capacity"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        type="number"
                    />
                    <TextField
                        label="Emergency Capacity"
                        name="emergency_capacity"
                        value={formData.emergency_capacity}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        type="number"
                    />
                    <TextField
                        label="Hospital Email"
                        name="hospital_email"
                        value={formData.hospital_email}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        type="email"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={submitting}
                        sx={{ mt: 2 }}
                    >
                        {submitting ? 'Updating...' : 'Update Profile'}
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default HospitalProfileUpdate;