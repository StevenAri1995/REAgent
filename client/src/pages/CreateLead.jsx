import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Container, Typography, TextField, Button, Box, Alert } from '@mui/material';

import { WORKFLOW_STAGES } from '../config/workflowConfig';

const CreateLead = () => {
    const [title, setTitle] = useState('');
    const [formData, setFormData] = useState({});
    const [titleError, setTitleError] = useState('');
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();

    const stageConfig = WORKFLOW_STAGES['Option_Identified'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        setTitleError('');

        let newErrors = {};
        let hasError = false;

        if (!title) {
            setTitleError('Lead title is required');
            hasError = true;
        }

        // Validate required fields client-side
        for (const field of stageConfig.fields) {
            const value = formData[field.name];
            if (field.required && !value) {
                newErrors[field.name] = `${field.label} is required`;
                hasError = true;
            }
            // 2. Type Check (Optional for create, but good for consistency)
            if (value && field.type === 'number') {
                if (isNaN(Number(value))) {
                    newErrors[field.name] = `${field.label} must be a valid number.`;
                    hasError = true;
                }
            }
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        try {
            await api.post('/leads', {
                title,
                data: formData // Send dynamic data
            });
            navigate('/');
        } catch (err) {
            console.error(err);
            setServerError(err.response?.data?.error || 'Failed to create lead');
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>Create New Lead</Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Stage: {stageConfig.label}
            </Typography>

            {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <TextField
                    fullWidth
                    required
                    label="Lead Title (Location/Store Name)"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        if (titleError) setTitleError('');
                    }}
                    sx={{ mb: 3 }}
                    error={!!titleError}
                    helperText={titleError}
                />

                {stageConfig.fields.map(field => {
                    if (field.type === 'file') {
                        return (
                            <Box key={field.name} sx={{ border: '1px dashed #ccc', p: 2, mb: 2, borderRadius: 1 }}>
                                <Typography variant="caption" display="block">{field.label} {field.required && '*'}</Typography>
                                <Button variant="outlined" component="label" size="small" sx={{ mt: 1 }}>
                                    Upload File
                                    <input type="file" hidden onChange={(e) => {
                                        const fileName = e.target.files[0]?.name;
                                        setFormData({ ...formData, [field.name]: `s3://bucket/${fileName}` });
                                        if (errors[field.name]) {
                                            setErrors({ ...errors, [field.name]: '' });
                                        }
                                    }} />
                                </Button>
                                {formData[field.name] && <Typography variant="caption" color="success.main" display="block" sx={{ mt: 1 }}>Attached: {formData[field.name]}</Typography>}
                                {errors[field.name] && <Typography variant="caption" color="error" display="block">{errors[field.name]}</Typography>}
                            </Box>
                        );
                    }
                    return (
                        <TextField
                            key={field.name}
                            label={field.label}
                            type={field.type === 'number' ? 'number' : 'text'}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleInputChange}
                            required={field.required}
                            fullWidth
                            sx={{ mb: 2 }}
                            InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
                            error={!!errors[field.name]}
                            helperText={errors[field.name]}
                        />
                    );
                })}

                <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 2 }}>
                    Create Lead
                </Button>
            </Box>
        </Container>
    );
};

export default CreateLead;
