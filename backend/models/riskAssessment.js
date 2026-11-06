  const mongoose = require("mongoose");

  const riskSchema = new mongoose.Schema({
    type: String,
    score: Number,
    description: String,
    level: String,
    
  });

  const priceOffer = new mongoose.Schema({
    selectedInsurance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InsuranceProduct",},
      valuation: Number,
      feePercentage: Number,
      feeAmount: Number,
  })

  const riskAssessmentSchema = new mongoose.Schema({
      organization: {
          type:String,
          required:true
      },
      bitrixDealId: {
        type: String,
        required: false,
      },
      priceOffers: {
        type: [priceOffer],
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