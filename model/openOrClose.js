const mongoose = require('mongoose')

const openorclose = mongoose.Schema({
    name: {
        type: String,
        default:"admin"
    },
    openorclose: {
        type: Boolean,
        default:false
    }
},
    {
        timestaps: true
    })

const Shop = mongoose.model('openorclose', openorclose)
module.exports =Shop;