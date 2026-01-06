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
    status: {
        type: DataTypes.ENUM('Draft', 'In_Progress', 'Approved', 'Rejected', 'Dropped'),
        defaultValue: 'Draft',
    },
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
