const mongoose = require("mongoose");

const riskSchema = new mongoose.Schema({
  type: String,
  score: Number,
  description: String,
  location: String,
  level: String,
});

const riskAssessmentSchema = new mongoose.Schema({
    organization: {
        type:String,
        required:true
    },
    selectedInsurance: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "InsuranceProduct",
      required: true,
    },
    location: {
        type:String,
        required:true
    },
  risks: {
    type: [riskSchema],
    default: [],
  },
  date:{
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model(
  "RiskAssessment",
  riskAssessmentSchema
);