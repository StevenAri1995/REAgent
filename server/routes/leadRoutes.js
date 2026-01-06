const express = require('express');
const { createLead, getLeads, getLeadById, submitStepData } = require('../controllers/leadController');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, createLead);
router.get('/', auth, getLeads);
router.get('/:id', auth, getLeadById);
router.post('/:id/step/:stepNumber', auth, submitStepData);

module.exports = router;
