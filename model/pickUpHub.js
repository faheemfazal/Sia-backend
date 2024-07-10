const mongoose = require('mongoose')

const hubLocation = mongoose.Schema({
    hubName: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },

    image: {
        type: Array,
    }
},
    {
        timestaps: true
    })

const hub = mongoose.model('hubLocation', hubLocation)
module.exports = hub;