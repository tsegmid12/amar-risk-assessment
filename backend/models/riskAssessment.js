const mongoose = require('mongoose');

const RiskAssessmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    organizationName: {
        type: String,
        required: true,
    },
    totalScore: {
        type: Number,
        required: true,
    },
})

const RiskAssessment = mongoose.model('RiskAssessment', RiskAssessmentSchema);
module.exports = RiskAssessment;