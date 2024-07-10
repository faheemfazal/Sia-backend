const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the User schema
const clientSchema = new Schema({
    name: {
        type: String,
    },
    
    email: {
        type: String,
      
        //match: [/.+\@.+\..+/, 'Please enter a valid email address'],
    },
    phoneNumber: {
        type: Number,
        //match: [/^\d{10}$/, 'Please enter a valid phone number'],
    },
    secondPhoneNumber: {
        type: Number,
    },
    paymentProblem: {
        type: Number,
        default: 0
    },
    gold:{
        type:Number,
        default:0
    },
    platinum:{
        type:Number,
        default:0
    },
    silver:{
        type:Number,
        default:0
    },

    block: {
        type: Boolean,
        default: false
    },
    coinDate:{
        type: String,
        default: ""
    }

}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
});

// Create the User model
const Client = mongoose.model('client', clientSchema);

module.exports = Client;
