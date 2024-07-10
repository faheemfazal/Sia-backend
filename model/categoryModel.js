const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        uppercase: true,
        unique: true
    },
    subCategory: {
        type: [String],  // Define subCategory as an array of strings
        uppercase: true,
        unique: true
    },
    block: {
        type: Boolean,
        default: false  // Correct the typo here
    }
},
    { timestamps: true });

module.exports = mongoose.model('categoryCollection', categorySchema)