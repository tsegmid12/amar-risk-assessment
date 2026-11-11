  const mongoose = require("mongoose");

  const riskSchema = new mongoose.Schema({
    type: String,
    score: Number,
    description: String,
    level: String,
    images: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "RiskImage"
    }]
  });

  const riskAssessmentSchema = new mongoose.Schema({
      organization: {
          type:String,
          required:true
      },
      bitrixDealId: {
        type: String,
        required: false,
      },
      selectedInsurance: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "InsuranceProduct",
        default: [],
      },
      user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      location: {
          type:String,
          required:true
      },
      orgEmail: {
          type: String,
          required: false
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