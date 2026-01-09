const { sequelize, User, Lead } = require('./models');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        await sequelize.sync({ force: true }); // Reset DB
        console.log('Database synced.');

        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create Users (New Roles)
        const users = [
            { name: 'State RE Lead', email: 'state_re@leasetrack.com', role: 'State_RE' },
            { name: 'Business Team', email: 'bt@leasetrack.com', role: 'BT' },
            { name: 'NHQ RE', email: 'nhq_re@leasetrack.com', role: 'RE_NHQ' },
            { name: 'Finance Team', email: 'finance@leasetrack.com', role: 'Finance' },
            { name: 'Legal Team', email: 'legal@leasetrack.com', role: 'Legal' },
            { name: 'Projects Team', email: 'projects@leasetrack.com', role: 'Projects' },
            { name: 'Central SSO', email: 'sso@leasetrack.com', role: 'Central_SSO' },
            { name: 'Apex Mgmt', email: 'apex@leasetrack.com', role: 'APEX' },
            { name: 'Admin', email: 'admin@leasetrack.com', role: 'Admin' },
        ];

        const createdUsers = {};
        for (const user of users) {
            const u = await User.create({ ...user, password: hashedPassword });
            createdUsers[user.role] = u.id;
        }
        console.log('Users created.');

        // 2. Create Sample Leads (Simulating Pan-India Stages)

        // Stage 1: Option Identified
        await Lead.create({
            title: 'Site 1 - Mumbai Bandra',
            stage: 'Option_Identified',
            sub_status: 'Option Identified',
            status: 'Active',
            created_by: createdUsers['State_RE'],
        });

        // Stage 2: Under BT Validation (Waiting for BT)
        await Lead.create({
            title: 'Site 2 - Bangalore Koramangala',
            stage: 'Under_BT_Validation',
            sub_status: 'Under BT Validation',
            status: 'Active',
            created_by: createdUsers['State_RE'],
        });

        // Stage 2: BT raised query (Waiting for State RE)
        await Lead.create({
            title: 'Site 3 - Delhi HKV',
            stage: 'Under_BT_Validation',
            sub_status: 'LT to revert on BT query',
            status: 'Active',
            created_by: createdUsers['State_RE'],
        });

        // Stage 3: Under Negotiation (State RE)
        await Lead.create({
            title: 'Site 4 - Pune KP',
            stage: 'Under_Negotiation',
            sub_status: 'Under Negotiation',
            status: 'Active',
            created_by: createdUsers['State_RE'],
        });

        // Stage 4: Under BT Approvals (Business feasibility pending)
        await Lead.create({
            title: 'Site 5 - Hyderabad Jubilee',
            stage: 'Under_BT_Approvals',
            sub_status: 'Business feasibility pending',
            status: 'Active',
            created_by: createdUsers['State_RE'],
        });

        // Stage 5: Termsheet Approval (Under NHQ RE / Finance)
        await Lead.create({
            title: 'Site 6 - Chennai Anna Nagar',
            stage: 'Termsheet_Approval_Process',
            sub_status: 'Under NHQ RE / Finance Approval',
            status: 'Active',
            created_by: createdUsers['State_RE'],
        });

        // Stage 6: Under Acquisition (Legal DD)
        await Lead.create({
            title: 'Site 7 - Kolkata Salt Lake',
            stage: 'Under_Acquisition',
            sub_status: 'Under Legal Due Diligence',
            status: 'Active',
            created_by: createdUsers['State_RE'],
        });

        // Stage 7: RFC Process (Fitout to start)
        await Lead.create({
            title: 'Site 8 - Ahmedabad CG Road',
            stage: 'RFC_Process',
            sub_status: 'RFC Done – Fitout to start',
            status: 'Active',
            created_by: createdUsers['State_RE'],
        });

        // Stage 8: Operational
        await Lead.create({
            title: 'Site 9 - Jaipur C Scheme',
            stage: 'Operational',
            sub_status: 'Operational',
            status: 'Operational',
            created_by: createdUsers['State_RE'],
        });

        // Stage 9: Rent Declaration (Under Finance/SSO)
        await Lead.create({
            title: 'Site 10 - Chandigarh Sec 17',
            stage: 'Rent_Declaration',
            sub_status: 'RD submitted to Central SSO',
            status: 'Active',
            created_by: createdUsers['State_RE'],
        });

        // Stage 10: Watchlist (Hold by BT)
        await Lead.create({
            title: 'Site 11 - Kochi MG Road',
            stage: 'Watchlist',
            sub_status: 'Hold by BT',
            status: 'Hold',
            created_by: createdUsers['State_RE'],
        });


        console.log('Seed data created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed();
