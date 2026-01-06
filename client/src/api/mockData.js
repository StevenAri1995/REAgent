import { WORKFLOW_CONFIG } from '../config/workflowConfig';

const MOCK_USERS = {
    'admin@leasetrack.com': { id: 'm1', name: 'Admin User', email: 'admin@leasetrack.com', role: 'Admin' },
    'state_re@leasetrack.com': { id: 'm2', name: 'State RE User', email: 'state_re@leasetrack.com', role: 'State_RE_LT' },
    'bt@leasetrack.com': { id: 'm3', name: 'BT User', email: 'bt@leasetrack.com', role: 'BT' },
    'epc@leasetrack.com': { id: 'm4', name: 'EPC User', email: 'epc@leasetrack.com', role: 'EPC' },
    'nhq@leasetrack.com': { id: 'm5', name: 'NHQ User', email: 'nhq@leasetrack.com', role: 'RE_NHQ' },
    'apex@leasetrack.com': { id: 'm6', name: 'Apex User', email: 'apex@leasetrack.com', role: 'APEX' },
    'legal@leasetrack.com': { id: 'm7', name: 'Legal User', email: 'legal@leasetrack.com', role: 'Legal' },
    'nso@leasetrack.com': { id: 'm8', name: 'NSO User', email: 'nso@leasetrack.com', role: 'NSO' },
};

const INITIAL_LEADS = [
    {
        id: 'l1',
        title: 'HSR Layout Store - Sector 2',
        current_step: 3,
        status: 'In_Progress',
        created_by: 'm2',
        creator: { name: 'State RE User' },
        LeadData: [
            { id: 'ld1', step_number: 1, status: 'Approved', data: { address: 'HSR 27th Main', city: 'Bangalore', area_sqft: 2500 }, createdAt: new Date(Date.now() - 86400000).toISOString() },
            { id: 'ld2', step_number: 2, status: 'Approved', data: { feasibility: 'Yes', sales_projection: 5000000 }, createdAt: new Date(Date.now() - 43200000).toISOString() }
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        workflowConfig: WORKFLOW_CONFIG
    },
    {
        id: 'l2',
        title: 'Indiranagar 100ft Road',
        current_step: 1,
        status: 'In_Progress',
        created_by: 'm2',
        creator: { name: 'State RE User' },
        LeadData: [],
        createdAt: new Date().toISOString(),
        workflowConfig: WORKFLOW_CONFIG
    }
];

export const getMockLeads = () => {
    const saved = localStorage.getItem('mock_leads');
    if (saved) {
        const leads = JSON.parse(saved);
        // Ensure workflowConfig is attached
        return leads.map(l => ({ ...l, workflowConfig: WORKFLOW_CONFIG }));
    }
    localStorage.setItem('mock_leads', JSON.stringify(INITIAL_LEADS));
    return INITIAL_LEADS;
};

export const saveMockLead = (lead) => {
    const leads = getMockLeads();
    const index = leads.findIndex(l => l.id === lead.id);
    if (index > -1) leads[index] = lead;
    else leads.push(lead);
    localStorage.setItem('mock_leads', JSON.stringify(leads));
};

export const getMockUser = (email) => MOCK_USERS[email];

export const getMockLeadsList = () => {
    return getMockLeads().map(l => ({
        id: l.id,
        title: l.title,
        current_step: l.current_step,
        status: l.status,
        creator: l.creator,
        createdAt: l.createdAt
    }));
};
