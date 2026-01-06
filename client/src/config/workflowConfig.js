export const WORKFLOW_CONFIG = {
    1: {
        role: 'State_RE_LT',
        name: 'Lead Creation',
        checklist: [
            'Enter property address and title',
            'Upload initial site photos',
            'Provide basic site measurements',
        ],
        fields: [
            { name: 'address', label: 'Property Address', type: 'text', required: true },
            { name: 'city', label: 'City', type: 'text', required: true },
            { name: 'area_sqft', label: 'Carpet Area (sqft)', type: 'number', required: true },
            { name: 'asking_rent', label: 'Asking Rent', type: 'number', required: true },
        ]
    },
    2: {
        role: 'BT',
        name: 'Validation (BT)',
        checklist: [
            'Verify location suitability',
            'Review format specifications',
            'Check competition proximity',
        ],
        fields: [
            { name: 'feasibility', label: 'Feasibility Study Result', type: 'select', options: ['Yes', 'No'], required: true },
            { name: 'sales_projection', label: 'Annual Sales Projection', type: 'number', required: true },
            { name: 'format_suitability', label: 'Format Suitability', type: 'text', required: true },
        ]
    },
    3: {
        role: 'EPC',
        name: 'Due Diligence (SDR)',
        checklist: [
            'Conduct Site Due Diligence Report (SDR)',
            'Check power availability',
            'Inspect structural integrity',
        ],
        fields: [
            { name: 'sdr_report_link', label: 'SDR Report Link/Reference', type: 'text', required: true },
            { name: 'power_load', label: 'Maximum Power Load (kW)', type: 'number', required: true },
            { name: 'structural_status', label: 'Structural Status', type: 'text', required: true },
        ]
    },
    4: {
        role: 'RE_NHQ',
        name: 'NHQ Commercial Validation',
        checklist: [
            'Check viability vs benchmarks',
            'Validate rent data for catchment',
        ],
        fields: [
            { name: 'is_viable', label: 'Commercial Viability', type: 'select', options: ['Yes', 'No'], required: true },
            { name: 'nhq_remarks', label: 'NHQ Remarks', type: 'text', required: true },
        ]
    },
    5: {
        role: 'State_RE_LT',
        name: 'Renegotiation',
        checklist: [
            'Renegotiate based on NHQ feedback',
            'Prepare final term sheet',
        ],
        fields: [
            { name: 'final_rent', label: 'Final Negotiated Rent', type: 'number', required: true },
            { name: 'term_sheet_link', label: 'Term Sheet Link', type: 'text', required: true },
        ]
    },
    6: {
        role: 'RE_NHQ',
        name: 'NHQ Final Approval',
        checklist: [
            'Verify renegotiated terms',
            'Check for CAM concerns',
        ],
        fields: [
            { name: 'final_nhq_approval', label: 'Final NHQ Approval', type: 'select', options: ['Approved', 'Rejected'], required: true },
            { name: 'cam_remarks', label: 'CAM/Operational Remarks', type: 'text' },
        ]
    },
    7: {
        role: 'APEX',
        name: 'Financial Approval (APEX)',
        checklist: [
            'Review CAPEX and P&L projections',
            'Final financial sign-off',
        ],
        fields: [
            { name: 'capex_amount', label: 'Total CAPEX', type: 'number', required: true },
            { name: 'p_and_l_link', label: '5-Year P&L Projection Link', type: 'text', required: true },
            { name: 'apex_status', label: 'Apex Decision', type: 'select', options: ['Approved', 'Rejected'], required: true },
        ]
    },
    8: {
        role: 'RE_NHQ',
        name: 'Site Code Release',
        checklist: [
            'Generate Site Code in ERP',
            'Intimate all stakeholders',
        ],
        fields: [
            { name: 'site_code', label: 'Generated Site Code', type: 'text', required: true },
        ]
    },
    9: {
        role: 'Legal',
        name: 'Legal Due Diligence (LDD)',
        checklist: [
            'Verify title deeds',
            'Draft LOI/MOU/ATL',
            'Finalize lease agreement',
        ],
        fields: [
            { name: 'ldd_status', label: 'LDD Result', type: 'select', options: ['Clear', 'Issues Found'], required: true },
            { name: 'agreement_type', label: 'Agreement Type Signed', type: 'text', required: true },
        ]
    },
    10: {
        role: 'NSO',
        name: 'Fitment & Store Launch',
        checklist: [
            'Coordinate merchandising',
            'Oversee fit-out work',
            'Plan launch events',
        ],
        fields: [
            { name: 'possession_date', label: 'Possession Date', type: 'date', required: true },
            { name: 'launch_date', label: 'Store Launch Date', type: 'date', required: true },
        ]
    },
    11: {
        role: 'State_RE_LT',
        name: 'Rent Declaration',
        checklist: [
            'Declare rent start after registration',
            'Upload registration documents',
        ],
        fields: [
            { name: 'rent_start_date', label: 'Rent Start Date', type: 'date', required: true },
            { name: 'registration_link', label: 'Lease Registration Doc Link', type: 'text', required: true },
        ]
    }
};
