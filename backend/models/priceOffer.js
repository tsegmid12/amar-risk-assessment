const mongoose = require('mongoose');

const PriceOffer = new mongoose.Schema({
    insuranceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InsuranceProduct',
    },
    quantity: Number,
    valuation: Number,
    feePercentage: Number,
    feeAmount: Number,
})

const PriceOfferSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    organization: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: false,
    },
   priceOffers: {
        type: [PriceOffer],
        default: [],
    },
    bitrixDealId: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('PriceOffer', PriceOfferSchema);