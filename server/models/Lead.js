const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Lead = sequelize.define('Lead', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stage: {
        type: DataTypes.ENUM(
            'Option_Identified',
            'Under_BT_Validation',
            'Under_Negotiation',
            'Under_BT_Approvals',
            'Termsheet_Approval_Process',
            'Under_Acquisition',
            'RFC_Process',
            'Operational',
            'Rent_Declaration',
            'Watchlist'
        ),
        defaultValue: 'Option_Identified',
    },
    sub_status: {
        type: DataTypes.STRING,
        defaultValue: 'Option Identified',
    },
    status: {
        type: DataTypes.ENUM('Active', 'Hold', 'Dropped', 'Operational'),
        defaultValue: 'Active',
    },
    // Keeping current_step temporarily for backward compat if needed, but defaulting to 1
    current_step: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    created_by: {
        type: DataTypes.UUID,
        allowNull: false,
    },
});

module.exports = Lead;
