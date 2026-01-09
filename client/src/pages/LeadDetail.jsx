import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Container, Typography, Button, Box, Paper, Divider,
    CircularProgress, Alert, TextField, Checkbox, Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import AuditLog from '../components/AuditLog';

import { WORKFLOW_STAGES, getActiveRole } from '../config/workflowConfig';

const LeadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lead, setLead] = useState(null);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchLead();
    }, [id]);

    const fetchLead = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/leads/${id}`);
            setLead(res.data);
            // Pre-fill form if needed
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error when user types
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleTransition = async (transition) => {
        try {
            // Client-side Validation
            const currentStageConfig = WORKFLOW_STAGES[lead.stage] || {};
            let newErrors = {};
            let hasError = false;

            if (currentStageConfig.fields) {
                for (const field of currentStageConfig.fields) {
                    const value = formData[field.name];

                    // 1. Required Check
                    if (field.required && !value) {
                        newErrors[field.name] = `${field.label} is required.`;
                        hasError = true;
                    }

                    // 2. Type Check
                    if (value) {
                        if (field.type === 'number') {
                            if (isNaN(Number(value))) {
                                newErrors[field.name] = `${field.label} must be a valid number.`;
                                hasError = true;
                            }
                        }
                        // Add more type checks as needed (e.g., date validation is usually handled by the input type="date" itself, but acts as a string)
                    }
                }
            }

            if (hasError) {
                setErrors(newErrors);
                return;
            }

            setSubmitting(true);
            await api.post(`/leads/${id}/step/0`, {
                data: formData,
                remarks: formData.remarks,
                targetStage: transition.targetStage,
                targetSubStatus: transition.targetSubStatus
            });
            setFormData({});
            setErrors({}); // Clear errors on successful submission
            fetchLead();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || 'Update failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (!lead) return <Alert severity="error">Lead not found</Alert>;

    const currentStageConfig = WORKFLOW_STAGES[lead.stage] || {};
    const activeRole = getActiveRole(lead.stage, lead.sub_status);
    const canEdit = (user.role === activeRole || user.role === 'Admin') && lead.status !== 'Dropped' && lead.status !== 'Operational';

    // Determine allowed transitions from current sub-status
    // In a real app we'd map sub-status to transitions more explicitly. 
    // Here we use the Stage's transitions, but sometimes we need to filter if we are in a sub-loop (like "LT to revert")
    // For simplicity, we show all stage transitions + logic

    let allowedTransitions = currentStageConfig.nextTransitions || [];

    // Filter if currently in "LT to revert", only allow "Response" -> back to BT?
    // Hardcoding specific logic for the Ping-Pong in Stage 2
    if (lead.sub_status === 'LT to revert on BT query') {
        allowedTransitions = [
            { label: 'Submit Response to BT', targetStage: 'Under_BT_Validation', targetSubStatus: 'Under BT Validation' }
        ];
    } else if (lead.sub_status === 'Under Rate Validation') {
        allowedTransitions = [
            { label: 'Validate Rate & Return', targetStage: 'Under_Negotiation', targetSubStatus: 'Under Negotiation' }
        ];
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
            <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>&larr; Back to Dashboard</Button>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4">{lead.title}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Chip label={currentStageConfig.label} color="primary" />
                    <Chip label={lead.sub_status} variant="outlined" />
                    <Chip label={lead.status} />
                </Box>
            </Box>

            <Paper sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>Action Board</Typography>

                {!canEdit && (
                    <Alert severity="info">
                        Currently awaiting action from: <strong>{activeRole}</strong>. You are in read-only mode.
                    </Alert>
                )}

                {canEdit && (
                    <Box>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Action Required by You ({user.role})
                        </Alert>

                        <Typography variant="subtitle2" gutterBottom>Checklist / Data Entry</Typography>
                        {currentStageConfig.checklist && currentStageConfig.checklist.map(item => (
                            <Box key={item} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Checkbox /> <Typography>{item}</Typography>
                            </Box>
                        ))}

                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>Required Attributes</Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            {currentStageConfig.fields && currentStageConfig.fields.map(field => {
                                if (field.type === 'file') {
                                    return (
                                        <Box key={field.name} sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                                            <Typography variant="caption" display="block">{field.label} {field.required && '*'}</Typography>
                                            <Button variant="outlined" component="label" size="small" sx={{ mt: 1 }}>
                                                Upload File
                                                <input type="file" hidden onChange={(e) => {
                                                    // Mock Upload Logic
                                                    const fileName = e.target.files[0]?.name;
                                                    setFormData({ ...formData, [field.name]: `s3://bucket/${fileName}` });
                                                    alert(`Simulated Upload: ${fileName}`);
                                                }} />
                                            </Button>
                                            {formData[field.name] && <Typography variant="caption" color="success.main" display="block">Attached: {formData[field.name]}</Typography>}
                                        </Box>
                                    );
                                }
                                return (
                                    <TextField
                                        key={field.name}
                                        label={field.label}
                                        type={field.type === 'date' ? 'date' : (field.type === 'number' ? 'number' : 'text')}
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleInputChange}
                                        required={field.required}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                        size="small"
                                        error={!!errors[field.name]}
                                        helperText={errors[field.name]}
                                    />
                                );
                            })}
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Enter remarks, query details, or justification..."
                            name="remarks"
                            value={formData.remarks || ''}
                            onChange={handleInputChange}
                            sx={{ my: 2 }}
                        />

                        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Decisions / Next Steps:</Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {allowedTransitions.map((t, idx) => (
                                <Button
                                    key={idx}
                                    variant="contained"
                                    color={t.label.includes('Reject') || t.label.includes('Drop') ? 'error' : 'primary'}
                                    onClick={() => handleTransition(t)}
                                    disabled={submitting}
                                >
                                    {t.label}
                                </Button>
                            ))}
                        </Box>
                    </Box>
                )}
            </Paper>

            <AuditLog history={lead.LeadData} />
        </Container>
    );
};

export default LeadDetail;
