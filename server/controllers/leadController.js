const { Lead, LeadData, User } = require('../models');
const { WORKFLOW_STAGES, getActiveRole } = require('../config/workflowConfig');

const createLead = async (req, res) => {
    try {
        if (req.user.role !== 'State_RE' && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Only State RE can create leads.' });
        }

        const { title, details } = req.body;

        const lead = await Lead.create({
            title,
            stage: 'Option_Identified',
            sub_status: 'Option Identified',
            status: 'Active',
            created_by: req.user.id
        });

        // Add initial history/log if needed (omitted for brevity)

        res.status(201).json(lead);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getLeads = async (req, res) => {
    try {
        const leads = await Lead.findAll({
            include: [
                { model: User, as: 'creator', attributes: ['name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(leads);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findByPk(req.params.id, {
            include: [
                { model: User, as: 'creator', attributes: ['name', 'email'] },
                {
                    model: LeadData,
                    attributes: ['id', 'step_number', 'data', 'remarks', 'status', 'submitted_by', 'createdAt']
                }
            ],
            order: [[LeadData, 'createdAt', 'ASC']]
        });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        // Attach workflow config for the frontend
        const response = lead.toJSON();
        response.workflowConfig = WORKFLOW_STAGES;

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const submitStepData = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, targetStage, targetSubStatus, remarks } = req.body;

        const lead = await Lead.findByPk(id);
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        // Security Check: Verify User Role against Active Role for current Stage/SubStatus
        const activeRole = getActiveRole(lead.stage, lead.sub_status);

        // Allow Admin bypass
        if (req.user.role !== 'Admin' && req.user.role !== activeRole) {
            return res.status(403).json({ error: `Unauthorized. Currently waiting for ${activeRole}.` });
        }

        // Update Lead State based on frontend input
        // Note: In production we should validate if this transition is allowed based on config
        if (targetStage) lead.stage = targetStage;
        if (targetSubStatus) lead.sub_status = targetSubStatus;

        // Map Status (High Level)
        if (targetStage === 'Watchlist') {
            if (targetSubStatus === 'To be dropped') lead.status = 'Dropped';
            else lead.status = 'Hold';
        } else if (targetStage === 'Operational') {
            lead.status = 'Operational';
        } else {
            lead.status = 'Active';
        }

        await lead.save();

        // Create Ledger Entry
        await LeadData.create({
            lead_id: lead.id,
            step_number: 0, // Using 0 as we moved away from linear steps
            data: { ...data, transitionTo: targetSubStatus, stage: targetStage },
            status: 'Approved',
            remarks: remarks || `Moved to ${targetSubStatus}`,
            submitted_by: req.user.id
        });

        res.json({ message: 'Lead updated successfully', lead });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteLead = async (req, res) => {
    try {
        const { id } = req.params;
        const lead = await Lead.findByPk(id);

        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        // Authorization Check
        // Allow Admin, or the Creator (State RE) to delete
        if (req.user.role !== 'Admin' && lead.created_by !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this lead' });
        }

        // Soft Delete: Mark as 'Dropped'
        lead.status = 'Dropped';
        lead.sub_status = 'Deleted by User';
        await lead.save();

        res.json({ message: 'Lead dropped successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createLead,
    getLeads,
    getLeadById,
    submitStepData,
    deleteLead
};
