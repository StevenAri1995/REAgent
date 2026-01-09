import { WORKFLOW_STAGES } from '../config/workflowConfig';

const MOCK_USERS = {
    'admin@leasetrack.com': { id: 'm1', name: 'Admin User', email: 'admin@leasetrack.com', role: 'Admin' },
    'state_re@leasetrack.com': { id: 'm2', name: 'State RE User', email: 'state_re@leasetrack.com', role: 'State_RE' },
    'bt@leasetrack.com': { id: 'm3', name: 'BT User', email: 'bt@leasetrack.com', role: 'BT' },
    'epc@leasetrack.com': { id: 'm4', name: 'Projects User', email: 'projects@leasetrack.com', role: 'Projects' },
    'nhq@leasetrack.com': { id: 'm5', name: 'NHQ User', email: 'nhq_re@leasetrack.com', role: 'RE_NHQ' },
    'orders@leasetrack.com': { id: 'm6', name: 'Apex User', email: 'apex@leasetrack.com', role: 'APEX' },
    'legal@leasetrack.com': { id: 'm7', name: 'Legal User', email: 'legal@leasetrack.com', role: 'Legal' },
    'finance@leasetrack.com': { id: 'm8', name: 'Finance User', email: 'finance@leasetrack.com', role: 'Finance' },
};

const INITIAL_LEADS = [
    {
        id: 'l1',
        title: 'HSR Layout Store - Sector 2',
        stage: 'Under_Negotiation',
        sub_status: 'LT to revert on BT query',
        status: 'Active',
        created_by: 'm3', // BT User
        creator: { name: 'BT User' },
        LeadData: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        workflowConfig: WORKFLOW_STAGES
    },
    {
        id: 'l2',
        title: 'Indiranagar 100ft Road',
        stage: 'Option_Identified',
        sub_status: 'Option Identified',
        status: 'Active',
        created_by: 'm2', // State RE
        creator: { name: 'State RE User' },
        LeadData: [],
        createdAt: new Date().toISOString(),
        workflowConfig: WORKFLOW_STAGES
    },
    {
        id: 'l3',
        title: 'Koramangala 5th Block',
        stage: 'Under_Legal_DD',
        sub_status: 'Legal Query Raised',
        status: 'Active',
        created_by: 'm7', // Legal
        creator: { name: 'State RE User' },
        LeadData: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        workflowConfig: WORKFLOW_STAGES
    },
    {
        id: 'l4',
        title: 'Whitefield Main Road',
        stage: 'Fitment_Launch',
        sub_status: 'Pending Projects Review',
        status: 'Active',
        created_by: 'm4', // Projects
        creator: { name: 'State RE User' },
        LeadData: [],
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        workflowConfig: WORKFLOW_STAGES
    }
];

export const getMockLeads = () => {
    const saved = localStorage.getItem('mock_leads');
    if (saved) {
        const leads = JSON.parse(saved);
        // Ensure workflowConfig is attached
        return leads.map(l => ({ ...l, workflowConfig: WORKFLOW_STAGES }));
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

export const deleteMockLead = (id) => {
    let leads = getMockLeads();
    // Soft delete logic: Update status to 'Dropped' OR remove it. 
    // Since real backend does soft delete, let's match that or just remove for mock simplicity?
    // User instruction says "Delete Lead", current backend implementation sets status to 'Dropped'.
    // Let's implement soft delete for mock to be consistent.
    const index = leads.findIndex(l => l.id === id);
    if (index > -1) {
        leads[index].status = 'Dropped';
        leads[index].sub_status = 'Deleted by User';
        localStorage.setItem('mock_leads', JSON.stringify(leads));
    }
};

export const getMockUser = (email) => MOCK_USERS[email];

export const getMockLeadsList = () => {
    return getMockLeads().map(l => ({
        id: l.id,
        title: l.title,
        stage: l.stage,
        sub_status: l.sub_status,
        status: l.status,
        creator: l.creator,
        created_by: l.created_by,
        createdAt: l.createdAt
    }));
};
