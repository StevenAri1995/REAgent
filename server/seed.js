const { sequelize, User } = require('./models');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        await sequelize.sync({ force: true }); // Reset DB
        console.log('Database synced.');

        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = [
            { name: 'Admin User', email: 'admin@leasetrack.com', role: 'Admin' },
            { name: 'State Real Estate Lead', email: 'state_re@leasetrack.com', role: 'State_RE_LT' },
            { name: 'Business Team', email: 'bt@leasetrack.com', role: 'BT' },
            { name: 'EPC Engineer', email: 'epc@leasetrack.com', role: 'EPC' },
            { name: 'National Head RE', email: 'nhq_re@leasetrack.com', role: 'RE_NHQ' },
            { name: 'APEX Mgmt', email: 'apex@leasetrack.com', role: 'APEX' },
            { name: 'Legal Team', email: 'legal@leasetrack.com', role: 'Legal' },
            { name: 'NSO Team', email: 'nso@leasetrack.com', role: 'NSO' },
        ];

        for (const user of users) {
            await User.create({ ...user, password: hashedPassword });
        }

        console.log('Seed data created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seed();
