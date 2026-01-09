const { Lead, LeadData, User } = require('../models');
const { WORKFLOW_STAGES, getActiveRole } = require('../config/workflowConfig');

// Helper for Validation
const validateFields = (fields, data) => {
    if (!fields) return null;
    for (const field of fields) {
        const value = data ? data[field.name] : null;

        // 1. Required Check
        if (field.required && !value) {
            return `Missing required field: ${field.label}`;
        }

        // 2. Type Check (Strict Server Side)
        if (value) {
            if (field.type === 'number' && isNaN(Number(value))) {
                return `Invalid type for ${field.label}: Expected Number`;
            }
            // Add date validation if strictly needed, currently input/date ensures format
        }
    }
    return null;
};

const createLead = async (req, res) => {
    try {
        if (req.user.role !== 'State_RE' && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Only State RE can create leads.' });
        }

        const { title, data } = req.body;
        const initialStageConfig = WORKFLOW_STAGES['Option_Identified'];

        // Strict Validation
        const validationError = validateFields(initialStageConfig?.fields, data);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const lead = await Lead.create({
            title,
            stage: 'Option_Identified',
            sub_status: 'Option Identified',
            status: 'Active',
            created_by: req.user.id
        });

        // Create Initial Ledger Entry
        await LeadData.create({
            lead_id: lead.id,
            step_number: 0,
            data: data || {}, // Specific Stage 1 data
            status: 'Approved',
            remarks: 'Initial Submission',
            submitted_by: req.user.id
        });

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

        const currentStageConfig = WORKFLOW_STAGES[lead.stage];

        // 1. Strict Field Validation
        const validationError = validateFields(currentStageConfig?.fields, data);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        // 2. Business Logic: Auto-Reject High Rent
        // If stage is Negotiation and rent > 200 (mock), reject or warn.
        if (lead.stage === 'Under_Negotiation' && data.negotiated_rent) {
            if (Number(data.negotiated_rent) > 200) {
                // Auto-Reject logic
                // If the user tries to move to Rate Validation, we block it or force rejection.
                // For now, let's just append a warning to the remarks, or effectively change the status if we wanted to be strict.
                // Let's implement a soft warning in the remarks for now.
                // Using a mutable variable for remarks requires it to be let-defined or modified in the create call
                // Modifying the request body 'remarks' variable won't work if it's const, need to pass modified value
            }
        }

        // Define final remarks to ensure System Warning is preserved if needed
        let finalRemarks = remarks || `Moved to ${targetSubStatus}`;
        if (lead.stage === 'Under_Negotiation' && Number(data.negotiated_rent) > 200) {
            finalRemarks += " [SYSTEM WARNING: Rent exceeds 200 threshold]";
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
            remarks: finalRemarks,
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
