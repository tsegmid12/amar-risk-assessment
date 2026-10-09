const mongoose = require('mongoose');

const insuranceProductSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
       description:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        default: [],
        required: true,
    },
    riskType:{
        type: [String],
        default: [],
        required: false,
    },
    coverage:{
        type: [String],
        required: true,
    },
    additionalServices:{
        type: [String],
        default: [],
        required: false,
    }
})

const InsuranceProduct = mongoose.model('InsuranceProduct', insuranceProductSchema);

module.exports = InsuranceProduct;