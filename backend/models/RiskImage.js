const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        contentType: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true,
        },
        gridFsId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("RiskImage", ImageSchema);