import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';

const CreateLead = () => {
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/leads', { title, details: { initialNotes: details } });
            navigate('/');
        } catch (err) {
            setError('Failed to create lead');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Create New Lead</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <TextField
                    fullWidth
                    required
                    label="Lead Title (Location/Store Name)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Initial Details / Notes"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained" fullWidth>Create Lead</Button>
            </Box>
        </Container>
    );
};

export default CreateLead;
