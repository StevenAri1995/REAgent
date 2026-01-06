const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LeadData = sequelize.define('LeadData', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    lead_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    step_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    data: {
        type: DataTypes.JSONB,
        defaultValue: {},
    },
    remarks: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Pending'
    },
    assigned_approver_role: {
        type: DataTypes.STRING,
        allowNull: true
    },
    submitted_by: {
        type: DataTypes.UUID,
        allowNull: true
    }
});

module.exports = LeadData;
