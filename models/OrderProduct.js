const mongoose = require("mongoose");

const orderProductSchema = new mongoose.Schema({

    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quantity: Number,
    price: Number,
    subTotal: Number,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

});

module.exports = mongoose.model("OrderProduct", orderProductSchema);