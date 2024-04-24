const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: [true, "Product name is required"],
  },
  description: {
    type: String,
    // required: [true, "Description is required"],
  },
  price: {
    type: Number,
    // required: [true, "Price is required"],
  },
  stocks: {
    type: Number,
    // required: [true, "Stocks is required"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sku: {
    type: String,
  },
  imagesUrl: [
    {
      type: String, // Store an array of Cloudinary URLs for additional images
    },
  ],
  categories: [
    {
      gender: String, // "Men" or "Women"
      type: String, // "Tops," "Bottoms," "Accessories," "Footwear," etc.
    },
  ],
  brand: String,
  sizes: [String],
  colors: [String],
  reviews: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: {
        type: Number,
        default: 0,
      },
      reviewText: {
        type: String,
        default: "",
      },
      adminReply: {
        type: String,
        default: "",
      },
    },
  ],
},
{
  timestamps: true, // Enable timestamps (createdAt and updatedAt fields)
});

module.exports = mongoose.model("Product", productSchema);
