//const mongoose = require('mongoose')

//const cartscema = new mongoose.Schema({

//    owner: {
//        type: mongoose.Schema.Types.ObjectId,
//        ref: 'usercollections'
//    },
//    item: [{
//        product: {
//            type: mongoose.Types.ObjectId,
//            ref: 'Product'
//        },
//        price: {
//            type: Number
//        },
//        quantity: {
//            type: Number,
//            default: 1
//        },
//        unit: {
//            type: String,
//            default: 1
//        },
//        total: {
//            type: Number
//        }


//    }]
//    , carttotal: {
//        type: Number
//    }
//})

//const Cart = mongoose.model('Cart', cartscema)

//module.exports = Cart




const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'client'
    },
    item: [{
        product: {
            type: mongoose.Types.ObjectId,
            ref: 'Product'
        },
        price: {
            type: Number
        },
        quantity: {
            type: Number,
            default: 1
        },
        unitType: {
            type: String,
            enum: ['KG', 'G', 'PIECE', 'PACK'],
            required: true
        },
        unit: {
            type: Number,
            default: 1
        },
        total: {
            type: Number
        }
    }],
    cartTotal: {
        type: Number,
        default: 0
    }
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
