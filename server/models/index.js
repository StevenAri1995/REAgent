const sequelize = require('../config/db');
const User = require('./User');
const Lead = require('./Lead');
const LeadData = require('./LeadData');

// Associations
User.hasMany(Lead, { foreignKey: 'created_by' });
Lead.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

Lead.hasMany(LeadData, { foreignKey: 'lead_id', onDelete: 'CASCADE' });
LeadData.belongsTo(Lead, { foreignKey: 'lead_id' });

module.exports = {
    sequelize,
    User,
    Lead,
    LeadData,
};
