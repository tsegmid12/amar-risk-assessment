const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,   
        ref: 'Organization',
        required: true,
    },
    assessmentId: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: 'RiskAssessment',
            required: true,
    },
    insuranceProductId: {
        type:[ mongoose.Schema.Types.ObjectId],
        ref: 'InsuranceProduct',
        required: true,
    },
});

const Recommendation = mongoose.model('Recommendation', RecommendationSchema);
module.exports = Recommendation;