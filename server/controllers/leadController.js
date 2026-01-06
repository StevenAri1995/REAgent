const { Lead, LeadData, User } = require('../models');
const WORKFLOW_STEPS = require('../config/workflowConfig');

const createLead = async (req, res) => {
    try {
        if (req.user.role !== 'State_RE_LT' && req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Only State RE LT can create leads.' });
        }

        const { title, details } = req.body;

        const lead = await Lead.create({
            title,
            current_step: 1,
            status: 'In_Progress',
            created_by: req.user.id
        });

        if (details) {
            await LeadData.create({
                lead_id: lead.id,
                step_number: 1,
                data: details,
                status: 'Approved',
                submitted_by: req.user.id
            });
            // Move to step 2 immediately after creation
            lead.current_step = 2;
            await lead.save();
        }

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
        response.workflowConfig = WORKFLOW_STEPS;

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

const submitStepData = async (req, res) => {
    try {
        const { id, stepNumber } = req.params;
        const { data, action, remarks } = req.body;
        const step = parseInt(stepNumber);

        const lead = await Lead.findByPk(id);
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        if (lead.current_step !== step && req.user.role !== 'Admin') {
            return res.status(400).json({ error: `Lead is currently at step ${lead.current_step}, not ${step}` });
        }

        const stepConfig = WORKFLOW_STEPS[step];
        if (!stepConfig) return res.status(400).json({ error: 'Invalid step' });

        // Validate User Role
        if (req.user.role !== stepConfig.role && req.user.role !== 'Admin') {
            return res.status(403).json({ error: `This step requires role: ${stepConfig.role}` });
        }

        // Handle Rejection (Loop Back)
        if (action === 'reject') {
            // If rejected, go back to previous step
            if (step > 1) {
                lead.current_step = step - 1;
                lead.status = 'In_Progress'; // Ensure it's not marked as Rejected overall if it's a loop
            } else {
                lead.status = 'Rejected'; // Hard rejection for step 1
            }
            await lead.save();

            await LeadData.create({
                lead_id: lead.id,
                step_number: step,
                data,
                status: 'Rejected',
                remarks,
                submitted_by: req.user.id
            });
            return res.json({ message: 'Step rejected and returned to previous user', lead });
        }

        // Handle Completion/Approval
        await LeadData.create({
            lead_id: lead.id,
            step_number: step,
            data,
            status: 'Approved',
            remarks,
            submitted_by: req.user.id
        });

        if (step < 11) {
            lead.current_step = step + 1;
            // Business Logic: Branching or Dropping
            if (step === 2 && data.feasibility === 'No') {
                lead.status = 'Dropped';
            }
        } else {
            lead.status = 'Approved';
        }

        await lead.save();
        res.json({ message: 'Step submitted successfully', lead });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createLead,
    getLeads,
    getLeadById,
    submitStepData
};
