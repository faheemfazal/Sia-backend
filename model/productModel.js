const mongoose = require('mongoose')

const product_schema = mongoose.Schema({
    productName: {
        type: String,
        required: true,
        uppercase: true,

    },
    category: {
        type: String,
        uppercase: true,

    },
    subCategory: {
        type: String,
        uppercase: true,
        unique: true
    },
    itemBehaviour: {
        type: String,
        required: true,
        uppercase: true,

    },
    price: {
        type: Number,
        
        required: true,
    },
    brand: {
        type: String,
    },

    quantity: {
        type: Number,
    },
    productImageUrl: {
        type: Array,
        required: true
    },
    discription:{
        type:String
    },
    unit: {
        type: String,

    },
    coin: {
        type: Number,
        
    },
    coinType: {
        type: String,
       
        uppercase: true
    },
    coin100g: {
        type: Number,
        
    },
    coinType100g: {
        type: String,
       
        uppercase: true
    },
    coin250g: {
        type: Number,
        
    },
    coinType250g: {
        type: String,
       
        uppercase: true
    },
    coin500g: {
        type: Number,
        
    },
    coinType500g: {
        type: String,
       
        uppercase: true
    },

    coin1kg: {
        type: Number,
        
    },
    coinType1kg: {
        type: String,
       
        uppercase: true
    },
    isDelete: {
        type: Boolean,
        default: false
    }
},
    {
        timestaps: true
    })

const products = mongoose.model('Product', product_schema)
module.exports = products;