import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert, Checkbox, FormControlLabel } from '@mui/material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    LeaseTrack Pro Sign In
                </Typography>
                {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Email Address"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                </Box>
                {/* Mock Mode Toggle */}
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={localStorage.getItem('use_mock') === 'true'}
                                onChange={(e) => {
                                    localStorage.setItem('use_mock', e.target.checked);
                                    window.location.reload();
                                }}
                            />
                        }
                        label="Enable Mock Mode (Offline)"
                    />
                </Box>

                {/* Helper for demo */}
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f0f0f0', borderRadius: 1, fontSize: '0.8rem', width: '100%' }}>
                    <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 1 }}>Demo Credentials (password: password123):</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <div><strong>State RE:</strong> state_re@leasetrack.com</div>
                        <div><strong>Business Team:</strong> bt@leasetrack.com</div>
                        <div><strong>EPC:</strong> epc@leasetrack.com</div>
                        <div><strong>Apex:</strong> apex@leasetrack.com</div>
                        <div><strong>Legal:</strong> legal@leasetrack.com</div>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
