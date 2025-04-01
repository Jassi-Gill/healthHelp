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

const PoliceProfileUpdate = () => {
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
                    badge_number: response.data.badge_number || '',
                    station_name: response.data.station_name || '',
                    rank: response.data.rank || '',
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
                    Update Police Profile
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
                        label="Badge Number"
                        name="badge_number"
                        value={formData.badge_number}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Station Name"
                        name="station_name"
                        value={formData.station_name}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Rank"
                        name="rank"
                        value={formData.rank}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
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

export default PoliceProfileUpdate;