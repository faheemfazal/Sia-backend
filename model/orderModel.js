const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "client",
    required: true,
  },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      unitType: { type: String, required: true },
      unit: {
        type: Number,
        default: 1,
      },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  paymentMethod: { type: String, required: true },
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

    transationId: {
        type: String,
    },
    paymentImg: {
        type: String,
    }, // Add this line
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
