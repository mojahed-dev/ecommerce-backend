// Order schema
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    transactionDate: {
        type: Date,
        default: new Date(),
    },
    status: {
        type: String,
        default: 'Pending',
    },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            name: String, 
            quantity: Number,
            price: Number,
            subTotal: Number,
        },
    ],
    total: {
        type: Number,
    },
    shippingMethod: {
        type: String,
        default: "Ninja Van"
    },
    paymentMethod: {
        type: String,
        default: "Cash on Delivery"
    }
});

module.exports = mongoose.model('Order', orderSchema);
