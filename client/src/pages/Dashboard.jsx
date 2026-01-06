import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Container, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Box, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
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
        // Navigate to create lead page or open modal
        // For now, let's just create a dummy one or go to a create page
        // We'll implement a simple create dialog later, or just a create page.
        navigate('/leads/new');
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

            {(user.role === 'State_RE_LT' || user.role === 'Admin') && (
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
                            <TableCell>Current Step</TableCell>
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
                                <TableCell>Step {lead.current_step}</TableCell>
                                <TableCell>{lead.creator?.name}</TableCell>
                                <TableCell>
                                    <Button size="small" onClick={() => navigate(`/leads/${lead.id}`)}>
                                        View / Action
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {leads.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No leads found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default Dashboard;
