import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Container, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Box, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { WORKFLOW_STAGES } from '../config/workflowConfig';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await api.get('/leads');
            setLeads(res.data);
        } catch (error) {
            console.error('Failed to fetch leads');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLead = async () => {
        navigate('/leads/new');
    };

    const handleDeleteClick = (id) => {
        setLeadToDelete(id);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!leadToDelete) return;

        try {
            await api.delete(`/leads/${leadToDelete}`);
            fetchLeads();
        } catch (error) {
            console.error('Failed to delete lead', error);
            alert('Failed to delete lead');
        } finally {
            setOpenDeleteDialog(false);
            setLeadToDelete(null);
        }
    };

    const cancelDelete = () => {
        setOpenDeleteDialog(false);
        setLeadToDelete(null);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Dashboard</Typography>
                <Box>
                    <Typography variant="subtitle1" component="span" sx={{ mr: 2 }}>
                        Welcome, {user.name} ({user.role})
                    </Typography>
                    <Button variant="outlined" onClick={logout}>Logout</Button>
                </Box>
            </Box>

            {/* Action Item Counters */}
            <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Paper sx={{ p: 2, flex: 1, bgcolor: '#e3f2fd', minWidth: '200px' }}>
                    <Typography variant="h6" color="primary">My Action Items</Typography>
                    <Typography variant="h3">
                        {leads.filter(l => !['Approved', 'Dropped', 'Rejected'].includes(l.status) && WORKFLOW_STAGES[l.stage]?.role === user.role).length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">Leads waiting for you</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, minWidth: '200px' }}>
                    <Typography variant="h6">Total Active Leads</Typography>
                    <Typography variant="h3">{leads.filter(l => !['Approved', 'Dropped', 'Rejected'].includes(l.status)).length}</Typography>
                </Paper>
            </Box>

            {/* Workflow Visualizer */}
            <Paper sx={{ p: 3, mb: 4, overflowX: 'auto' }}>
                <Typography variant="h6" gutterBottom>Overall Workflow</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', minWidth: '1000px' }}>
                    {Object.values(WORKFLOW_STAGES).sort((a, b) => a.id - b.id).map((step) => {
                        const isMyRole = step.role === user.role;
                        // Count leads at this specific step
                        const countAtStep = leads.filter(l => l.stage === Object.keys(WORKFLOW_STAGES).find(key => WORKFLOW_STAGES[key].id === step.id) && l.status === 'Active').length;

                        return (
                            <React.Fragment key={step.id}>
                                <Box sx={{
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    width: '120px',
                                    p: 1,
                                    bgcolor: isMyRole ? '#e8f5e9' : 'transparent',
                                    border: isMyRole ? '2px solid #4caf50' : '1px solid #ddd',
                                    borderRadius: 2,
                                    mx: 1
                                }}>
                                    <Box sx={{
                                        width: 24, height: 24, borderRadius: '50%',
                                        bgcolor: isMyRole ? '#4caf50' : '#ddd',
                                        color: isMyRole ? 'white' : 'black',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', mb: 1
                                    }}>
                                        {step.id}
                                    </Box>
                                    <Typography variant="caption" align="center" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                        {step.label}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="textSecondary" sx={{ mt: 0.5 }}>
                                        ({step.role})
                                    </Typography>
                                    {countAtStep > 0 && (
                                        <Chip
                                            label={countAtStep}
                                            size="small"
                                            color={isMyRole ? "error" : "default"}
                                            sx={{ mt: 1, height: 20, fontSize: '0.7rem' }}
                                        />
                                    )}
                                </Box>
                                {step.id < 10 && <Box sx={{ flex: 1, height: '2px', bgcolor: '#ddd', minWidth: '20px' }} />}
                            </React.Fragment>
                        );
                    })}
                </Box>
            </Paper>

            {(user.role === 'State_RE' || user.role === 'Admin') && (
                <Button variant="contained" color="primary" onClick={handleCreateLead} sx={{ mb: 3 }}>
                    Create New Lead
                </Button>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Lead Title</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Stage</TableCell>
                            <TableCell>Sub-Status</TableCell>
                            <TableCell>Created By</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {leads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell>{lead.title}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={lead.status}
                                        color={lead.status === 'Approved' ? 'success' : lead.status === 'Rejected' ? 'error' : 'primary'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{WORKFLOW_STAGES[lead.stage]?.label || lead.stage}</TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="textSecondary">{lead.sub_status}</Typography>
                                </TableCell>
                                <TableCell>{lead.creator?.name}</TableCell>
                                <TableCell>
                                    <Button size="small" onClick={() => navigate(`/leads/${lead.id}`)}>
                                        View / Action
                                    </Button>
                                    {(user.role === 'Admin' || (user.id === lead.created_by && lead.status !== 'Operational')) && (
                                        <Button size="small" color="error" onClick={() => handleDeleteClick(lead.id)} sx={{ ml: 1 }}>
                                            Delete
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {leads.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No leads found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={cancelDelete}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirm Delete"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this lead? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={cancelDelete}>Cancel</Button>
                    <Button onClick={confirmDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Dashboard;
