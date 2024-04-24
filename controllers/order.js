// const express = require("express");

const Cart = require("../models/Cart");
const Order = require("../models/Order");
const OrderProduct = require("../models/OrderProduct");
const Product = require("../models/Product");


/**
 * @route   POST /orders/place-order
 * @desc    Creating an order
 * @access  Private (authentication required)
 */

const placeOrder = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Find the user's cart
      const cart = await Cart.findOne({ userId });
  
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
  
      // Calculate the total price of the items in the cart
      const total = cart.items.reduce((accu, item) => accu + item.subTotal, 0);
  
      // Create an order document
      const order = new Order({
        userId,
        total,
        products: cart.items.map((cartItem) => ({
          productId: cartItem.productId,
          name: cartItem.name,
          quantity: cartItem.quantity,
          price: cartItem.price,
          subTotal: cartItem.subTotal, // Set subTotal for each product in the order
        })),
      });
  
      // Save the order to the database
      await order.save();
  
      // Create order product records based on items in the cart
      const orderProducts = cart.items.map((cartItem) => ({
        orderId: order._id,
        productId: cartItem.productId,
        userId: userId,
        quantity: cartItem.quantity,
        price: cartItem.price,
        subTotal: cartItem.subTotal, // Set subTotal for order products
      }));
  
      // Save the order product records to the database
      await OrderProduct.insertMany(orderProducts);
  
      // Clear the user's cart (remove all items)
      await Cart.updateOne({ userId }, { $set: { items: [], total: 0 } });
  
      return res.json(true);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  



/**
 * @route   PUT /orders/status
 * @desc    Change ordered status(pending, shipped, delivered)
 * @access  Private (admin authentication required)
 */

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, {new: true});

        if(!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).send(true);
    }catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });

    }
};



/**
 * @route   GET /orders
 * @desc    View all ordered products/items
 * @access  Private (authentication required)
 */

const getOrderedProducts = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all orders for the user using the userId
        const orders = await Order.find({ userId });

        return res.status(200).json({ orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


/**
 * @route   GET /orders/all
 * @desc    View all ordered products/items
 * @access  Private (admin authentication required)
 */

const getOrderedProduct = async (req, res) => {
    try {
        
        if (!req.user.isAdmin) {
            return res.send("Forbidden");
        }

        // Find all orders and populate user information
        const orderedProduct = await OrderProduct.find({}).populate('userId', 'firstName lastName mobileNo street city province postalcode country')
        .populate('productId', 'name price quantity sku')
        .populate('orderId', 'transactionDate status total shippingMethod paymentMethod');

        if (orderedProduct) {
            return res.status(200).json({ orderedProduct });
        } else {
            return res.send("No order exists");
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// const getOrderedProduct = async (req, res) => {
//     try {
        
//         if(!req.user.isAdmin) {
//             return res.send("Forbidden");
//         }

//         // Find all orders
//         const orders = await Order.find({});
//         if(orders) {
//             return res.status(200).json({ orders });
//         } else {
//             return res.send("No order exists");
//         }

        
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// };





module.exports = {
    placeOrder, getOrderedProducts, updateOrderStatus, getOrderedProduct
};

