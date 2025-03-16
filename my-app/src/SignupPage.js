import React, { useState } from 'react';
import {
    Avatar,
    Box,
    Button,
    Container,
    CssBaseline,
    Grid,
    Link,
    TextField,
    Typography,
    Alert,
    AlertTitle
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const SignupPage = ({ goToLogin }) => {
    const [userType, setUserType] = useState('patient');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(''); // Clear any previous errors

        // Basic validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Here you would typically integrate with your Django backend
        console.log('Signup attempt:', { userType, email, username, password });

        // Redirect to login after successful signup
        // This is where you'd handle the API response
        // If signup is successful, you can redirect to login
        // goToLogin();
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <PersonAddIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Create Account
                </Typography>
                <Typography variant="body2" color="textSecondary" align="center">
                    Sign up to access the Emergency Response System
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <Grid container spacing={2} mb={2}>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant={userType === 'patient' ? 'contained' : 'outlined'}
                                onClick={() => setUserType('patient')}
                            >
                                Patient
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant={userType === 'driver' ? 'contained' : 'outlined'}
                                onClick={() => setUserType('driver')}
                            >
                                Driver
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant={userType === 'hospital' ? 'contained' : 'outlined'}
                                onClick={() => setUserType('hospital')}
                            >
                                Hospital
                            </Button>
                        </Grid>
                        <Grid item xs={6}>
                            <Button
                                fullWidth
                                variant={userType === 'police' ? 'contained' : 'outlined'}
                                onClick={() => setUserType('police')}
                            >
                                Police
                            </Button>
                        </Grid>
                    </Grid>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            <AlertTitle>Error</AlertTitle>
                            {error}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up as {userType.charAt(0).toUpperCase() + userType.slice(1)}
                    </Button>

                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link href="#" variant="body2" onClick={goToLogin}>
                                Already have an account? Log in
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};

export default SignupPage;