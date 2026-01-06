import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
    Container, Typography, Stepper, Step, StepLabel, Button, Box, Paper,
    CircularProgress, Alert, TextField, MenuItem, Checkbox, FormControlLabel,
    FormGroup, Divider, List, ListItem, ListItemText, ListItemIcon, Chip
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useAuth } from '../context/AuthContext';
import AuditLog from '../components/AuditLog';

const LeadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lead, setLead] = useState(null);
    const [formData, setFormData] = useState({});
    const [checklistState, setChecklistState] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchLead();
    }, [id]);

    const fetchLead = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/leads/${id}`);
            setLead(res.data);
            // Initialize checklist state
            const currentStepConfig = res.data.workflowConfig ? res.data.workflowConfig[res.data.current_step] : null;
            if (currentStepConfig && currentStepConfig.checklist) {
                const initialChecklist = {};
                currentStepConfig.checklist.forEach((_, index) => {
                    initialChecklist[index] = false;
                });
                setChecklistState(initialChecklist);
            }
        } catch (err) {
            setError('Failed to load lead');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleChecklistChange = (index) => {
        setChecklistState({ ...checklistState, [index]: !checklistState[index] });
    };

    const handleSubmitStep = async (action = 'submit') => {
        // Basic validation: Check if all checklist items are checked
        const currentStepConfig = lead.workflowConfig ? lead.workflowConfig[lead.current_step] : null;
        if (!currentStepConfig) return;

        const allChecked = Object.values(checklistState).every(v => v === true);

        if (action === 'submit' && currentStepConfig.checklist && !allChecked) {
            setError('Please complete all checklist items before submitting.');
            return;
        }

        try {
            setSubmitting(true);
            await api.post(`/leads/${id}/step/${lead.current_step}`, {
                data: formData,
                remarks: formData.remarks,
                action
            });
            setFormData({});
            setChecklistState({});
            setError('');
            fetchLead(); // Refresh
        } catch (err) {
            setError(err.response?.data?.error || 'Submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (!lead) return <Alert severity="error">Lead not found</Alert>;

    const currentStep = lead.current_step;
    const config = lead.workflowConfig ? lead.workflowConfig[currentStep] : null;
    const isApproved = lead.status === 'Approved';
    const isAdmin = user.role === 'Admin';
    const canPerformAction = config && (user.role === config.role || isAdmin) && !isApproved && lead.status !== 'Dropped';

    const stepsLabels = lead.workflowConfig ? Object.values(lead.workflowConfig).map(s => s.name) : [];

    if (isApproved) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>&larr; Back to Dashboard</Button>
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom color="success.main">Lead Fully Approved!</Typography>
                    <Typography variant="body1">This property has completed all 11 steps and is ready for registration/accounts.</Typography>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6">Summary of Details</Typography>
                    <Box sx={{ mt: 2, textAlign: 'left' }}>
                        {lead.LeadData.map(ld => (
                            <Box key={ld.id} sx={{ mb: 1 }}>
                                <Typography variant="subtitle2">Step {ld.step_number}: {lead.workflowConfig && lead.workflowConfig[ld.step_number] ? lead.workflowConfig[ld.step_number].name : `Step ${ld.step_number}`}</Typography>
                                <pre style={{ fontSize: '0.8rem', background: '#f5f5f5', padding: '5px' }}>
                                    {JSON.stringify(ld.data, null, 2)}
                                </pre>
                            </Box>
                        ))}
                    </Box>
                    <Button variant="contained" sx={{ mt: 3 }} onClick={() => window.print()}>Download/Print Report</Button>
                </Paper>
                <AuditLog history={lead.LeadData} />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
            <Button onClick={() => navigate('/')} sx={{ mb: 2 }}>&larr; Back to Dashboard</Button>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">{lead.title}</Typography>
                <Chip
                    label={lead.status}
                    color={lead.status === 'Dropped' ? 'error' : 'primary'}
                />
            </Box>

            <Stepper activeStep={currentStep - 1} alternativeLabel sx={{ mb: 4 }}>
                {stepsLabels.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6" gutterBottom color="primary">
                    Step {currentStep}: {config?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Assigned Role: <strong>{config?.role}</strong>
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Checklist Section */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">Checklist</Typography>
                        <FormGroup>
                            {config?.checklist && config.checklist.map((item, index) => (
                                <FormControlLabel
                                    key={index}
                                    control={
                                        <Checkbox
                                            checked={checklistState[index] || false}
                                            onChange={() => handleChecklistChange(index)}
                                            disabled={!canPerformAction}
                                        />
                                    }
                                    label={item}
                                />
                            ))}
                        </FormGroup>
                    </Box>

                    {/* Form Section */}
                    <Box sx={{ flex: 2 }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">Form Details</Typography>
                        {config?.fields && config.fields.map((field) => (
                            <Box key={field.name} sx={{ mb: 2 }}>
                                {field.type === 'select' ? (
                                    <TextField
                                        select
                                        fullWidth
                                        label={field.label}
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleInputChange}
                                        required={field.required}
                                        disabled={!canPerformAction}
                                    >
                                        {field.options && field.options.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                                    </TextField>
                                ) : (
                                    <TextField
                                        fullWidth
                                        type={field.type}
                                        label={field.label}
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleInputChange}
                                        required={field.required}
                                        disabled={!canPerformAction}
                                        InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
                                    />
                                )}
                            </Box>
                        ))}

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Remarks / Comments"
                            name="remarks"
                            value={formData.remarks || ''}
                            onChange={handleInputChange}
                            disabled={!canPerformAction}
                            sx={{ mb: 2 }}
                        />

                        {canPerformAction && (
                            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleSubmitStep('submit')}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit / Approve'}
                                </Button>
                                {currentStep > 1 && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleSubmitStep('reject')}
                                        disabled={submitting}
                                    >
                                        Reject / Back to Previous
                                    </Button>
                                )}
                            </Box>
                        )}
                        {!canPerformAction && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                You do not have permission to take action on this step ({config?.role} required).
                            </Alert>
                        )}
                    </Box>
                </Box>
            </Paper>

            <AuditLog history={lead.LeadData} />
        </Container>
    );
};

export default LeadDetail;
