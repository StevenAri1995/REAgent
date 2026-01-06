import React from 'react';
import {
    Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';

const AuditLog = ({ history }) => {
    return (
        <TableContainer component={Paper} sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ p: 2 }}>Audit Log / History</Typography>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Step</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Remarks</TableCell>
                        <TableCell>Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {history.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>Step {log.step_number}</TableCell>
                            <TableCell>
                                <Chip
                                    label={log.status}
                                    size="small"
                                    color={log.status === 'Approved' ? 'success' : log.status === 'Rejected' ? 'error' : 'default'}
                                />
                            </TableCell>
                            <TableCell>{log.remarks || 'No remarks'}</TableCell>
                            <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default AuditLog;
