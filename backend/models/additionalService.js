const mongoose = require('mongoose');

const AdditionalServiceSchema = new mongoose.Schema({
    name:{
        type: [String],
        required: true,
    },
})

module.exports = mongoose.model('AdditionalService', AdditionalServiceSchema);