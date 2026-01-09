const WORKFLOW_STAGES = {
    'Option_Identified': {
        id: 1,
        label: 'Option Identified',
        role: 'State_RE',
        subStatuses: ['Option Identified'],
        checklist: [
            'Identify potential site',
            'Enter basic details'
        ],
        fields: [
            { name: 'location_coordinates', label: 'Location Coordinates', type: 'text', required: true },
            { name: 'carpet_area', label: 'Carpet Area (sqft)', type: 'number', required: true },
            { name: 'photos', label: 'Site Photos', type: 'file', required: true }
        ],
        nextTransitions: [
            { label: 'Submit for Validation', targetStage: 'Under_BT_Validation', targetSubStatus: 'Under BT Validation' }
        ]
    },
    'Under_BT_Validation': {
        id: 2,
        label: 'Under BT Validation',
        role: 'BT',
        subStatuses: ['Under BT Validation', 'LT to revert on BT query'],
        checklist: [
            'Validate Catchment',
            'Check Cannibalization'
        ],
        fields: [
            { name: 'sales_projection', label: 'Annual Sales Projection', type: 'number', required: true },
            { name: 'catchment_score', label: 'Catchment Score (1-10)', type: 'number' }
        ],
        nextTransitions: [
            { label: 'Approve & Move to Negotiation', targetStage: 'Under_Negotiation', targetSubStatus: 'Under Negotiation' },
            { label: 'Raise Query to State RE', targetStage: 'Under_BT_Validation', targetSubStatus: 'LT to revert on BT query', actionRole: 'State_RE' },
            { label: 'Reject / Drop', targetStage: 'Watchlist', targetSubStatus: 'To be dropped' }
        ]
    },
    'Under_Negotiation': {
        id: 3,
        label: 'Under Negotiation',
        role: 'State_RE',
        subStatuses: ['Under Negotiation', 'Under Rate Validation', 'SDR Pending', 'Delayed as BTS / Under Construction'],
        checklist: [
            'Negotiate Rentals',
            'Confirm CAPEX scope'
        ],
        fields: [
            { name: 'negotiated_rent', label: 'Negotiated Rent', type: 'number', required: true },
            { name: 'capex_ask', label: 'Landlord Capex Scope', type: 'text' }
        ],
        nextTransitions: [
            { label: 'Submit for Rate Validation', targetStage: 'Under_Negotiation', targetSubStatus: 'Under Rate Validation', actionRole: 'BT' },
            { label: 'Submit for BT Approval', targetStage: 'Under_BT_Approvals', targetSubStatus: 'Business feasibility pending' }
        ]
    },
    'Under_BT_Approvals': {
        id: 4,
        label: 'Under BT Approvals',
        role: 'BT',
        subStatuses: ['Business feasibility pending', 'Layout approval Pending', 'Under SCO approval', 'Under SOW approval'],
        checklist: [
            'Finalize Sales Projection',
            'Approve Layout',
            'Freeze Scope of Work'
        ],
        fields: [
            { name: 'final_projection', label: 'Final Sales Projection', type: 'number', required: true },
            { name: 'layout_plan', label: 'Layout Plan', type: 'file', required: true }
        ],
        nextTransitions: [
            { label: 'Approve & Move to Termsheet', targetStage: 'Termsheet_Approval_Process', targetSubStatus: 'Under NHQ RE / Finance Approval' }
        ]
    },
    'Termsheet_Approval_Process': {
        id: 5,
        label: 'Termsheet Approval',
        role: 'RE_NHQ',
        subStatuses: ['Under NHQ RE / Finance Approval', 'Termsheet under BT approval', 'Termsheet under LT signoff', 'Under Apex Approval'],
        checklist: [
            'Validate Commercial Terms',
            'Ensure Budget Adherence'
        ],
        fields: [
            { name: 'commercial_terms', label: 'Final Commercial Terms', type: 'text', required: true },
            { name: 'standard_clause_deviation', label: 'Deviation from Standard Clauses', type: 'text' }
        ],
        nextTransitions: [
            { label: 'Approve & Move to Acquisition', targetStage: 'Under_Acquisition', targetSubStatus: 'Under Legal Due Diligence' }
        ]
    },
    'Under_Acquisition': {
        id: 6,
        label: 'Under Acquisition',
        role: 'Legal',
        subStatuses: ['Under Legal Due Diligence', 'Under LOI / Agreement', 'LOI / MOU signed', 'Under Owner SOW completion', 'ATL signed', 'Agreement registered', 'RFC Offered'],
        checklist: [
            'Clear Title Check',
            'Sign Agreements',
            'Register Lease'
        ],
        fields: [
            { name: 'ldd_report', label: 'LDD Report', type: 'file', required: true },
            { name: 'registration_date', label: 'Registration Date', type: 'date' }
        ],
        nextTransitions: [
            { label: 'Handover to Projects (RFC)', targetStage: 'RFC_Process', targetSubStatus: 'RFC Done – Fitout to start' }
        ]
    },
    'RFC_Process': {
        id: 7,
        label: 'RFC / Fitout',
        role: 'Projects',
        subStatuses: ['RFC Done – Fitout to start', 'RFC Done – under Fitout', 'RFC Done – Fitout on hold'],
        checklist: [
            'Project Planning',
            'Execution',
            'Store Handover'
        ],
        fields: [
            { name: 'handover_date', label: 'Store Handover Date', type: 'date', required: true }
        ],
        nextTransitions: [
            { label: 'Mark Operational', targetStage: 'Operational', targetSubStatus: 'Operational' }
        ]
    },
    'Operational': {
        id: 8,
        label: 'Operational',
        role: 'Central_SSO',
        subStatuses: ['Operational'],
        checklist: [],
        fields: [
            { name: 'go_live_date', label: 'Go Live Date', type: 'date', required: true }
        ],
        nextTransitions: [
            { label: 'Start Rent Declaration', targetStage: 'Rent_Declaration', targetSubStatus: 'RD by State RE' }
        ]
    },
    'Rent_Declaration': {
        id: 9,
        label: 'Rent Declaration',
        role: 'Finance',
        subStatuses: ['RD by State RE', 'RD approved by BT', 'RD submitted to Central SSO'],
        checklist: [
            'Start Rent Payment',
            'Activate in ERP'
        ],
        fields: [
            { name: 'payment_start_date', label: 'Rent Payment Start Date', type: 'date', required: true },
            { name: 'vendor_code', label: 'SAP Vendor Code', type: 'text' }
        ],
        nextTransitions: []
    },
    'Watchlist': {
        id: 10,
        label: 'Watchlist',
        role: 'BT',
        subStatuses: ['Hold by BT', 'Hold by RE', 'Long Lead', 'To be dropped'],
        checklist: [],
        fields: [],
        nextTransitions: []
    }
};

const getActiveRole = (stage, subStatus) => {
    if (subStatus === 'LT to revert on BT query') return 'State_RE';
    if (subStatus === 'Under Rate Validation') return 'BT';
    if (subStatus === 'Termsheet under BT approval') return 'BT';
    if (subStatus === 'Under Apex Approval') return 'APEX';
    if (subStatus === 'RD by State RE') return 'State_RE';
    if (subStatus === 'RD approved by BT') return 'BT';
    return WORKFLOW_STAGES[stage]?.role;
};

module.exports = {
    WORKFLOW_STAGES,
    getActiveRole
};
