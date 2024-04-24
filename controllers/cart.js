const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");



/**
 * @route   POST /carts
 * @desc    Add product to cart
 * @access  Private (authentication required)
 */
const addToCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        // Fetch product details including the name
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Calculate the subtotal for the current item
        const subTotal = product.price * quantity;

        // Fetch the user's cart
        let cart = await Cart.findOne({ userId });

        // If the user doesn't have a cart yet, create one
        if (!cart) {
            cart = new Cart({
                userId,
                items: [],
                total: 0, // Initialize the cart's total to 0
            });
        }

        // Check if the product is already in the cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (existingItemIndex !== -1) {
            // Update the quantity and subtotal if the product is already in the cart
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].subTotal += subTotal; // Update subTotal
        } else {
            // Add a new item to the cart if it's not already in the cart
            cart.items.push({
                productId,
                name: product.name, // Include product name
                quantity,
                price: product.price,
                subTotal, // Use subTotal for item subtotal
            });
        }

        // Update the cart's total based on item subtotals
        cart.total = cart.items.reduce((acc, item) => acc + item.subTotal, 0);

        // Save the updated cart
        await cart.save();

        return res.status(200).send(true);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * @route   GET /carts/my-cart
 * @desc    Retrieve all the product items that are added to cart
 * @access  Private (authentication required)
 */

const getCart = async (req, res) => {
    try {
        // Assuming you have a userId stored in the authenticated user's token
        const userId = req.user.id; // Extract the user ID from the token

        // Find the cart items for the specified user
         const userCart = await Cart.findOne({ userId }); // Use findOne instead of find
        // const userCart = await Cart.findOne({ userId }).populate('items.productId');


        if (!userCart) {
            return res.status(200).json({ cartItems: [], total: 0 });
        }

        // Extract the product details from the cart items
        const cartItems = userCart.items.map((cartItem) => {
            return {
                productId: cartItem.productId,
                name: cartItem.name,
                price: cartItem.price,
                quantity: cartItem.quantity,
                subTotal: cartItem.subTotal,
            };
        });

        // Calculate the total
        const total = userCart.total;

        return res.status(200).json({ cartItems, total });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const updateCartItemQuantity = async (req, res) => {
    try {
        // Fetch the user's cart
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        const cart = await Cart.findOne({ userId });
       
        console.log(cart);

        if (!cart) {
            throw new Error("Cart not found");
        }

        // Check if the product exists in the cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (existingItemIndex === -1) {
            throw new Error("Product not found in the cart");
        }

        // Fetch product details including the price
        const product = await Product.findById(productId);

        if (!product) {
            throw new Error("Product not found");
        }

        // Calculate the new subtotal based on the updated quantity
        const newSubTotal = product.price * quantity;

        // Update the quantity and subtotal for the item
        cart.items[existingItemIndex].quantity = quantity;
        cart.items[existingItemIndex].subTotal = newSubTotal;

        // Update the cart's total based on item subtotals
        cart.total = cart.items.reduce((acc, item) => acc + item.subTotal, 0);

        // Save the updated cart
        const updatedCart =  await cart.save();
        if (updatedCart) {
            return res.send(true);
        } else {
            return res.send(false);
        }

    } catch (error) {
        throw error; // Throw any errors for handling in the calling function
    }
};




/**
 * @route   DELETE /carts/:productId
 * @desc    Remove product from cart
 * @access  Private (authentication required)
 */
const removeProduct = async (req, res) => {
    try {

        const userId = req.user.id;
        const productIdToRemove = req.params.productId;
        // const productIdToRemove = req.productId;

        console.log("user id", userId);
        console.log("product id: ", productIdToRemove);

        // Find the user's cart
        const cart  = await Cart.findOne({ userId });
        console.log(cart);

        if(!cart) {
            return res.status(404).json({ message: "Cart not found" })
        };

        // Check if the product to remove exits in the cart
        const itemIndexToRemove = cart.items.findIndex((item) => item.productId.toString() === productIdToRemove);

        if (itemIndexToRemove ===  -1) {
            return res.status(404).json({ message: "Product not found in the cart" });

        }

        // Remove the product from the cart
        cart.items.splice(itemIndexToRemove, 1);

        // If no item remains, set total to 0
        if(cart.items.length == 0) {
            cart.total = 0;
        }

        // Update the cart's updateAt timestamp
        cart.updatedAt = new Date();

        // Save the updated cart
        await cart.save();

        return res.status(200).send(true);

    } catch(error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};





module.exports = {
    addToCart, updateCartItemQuantity, removeProduct, getCart
};