const express = require("express");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
const { 
    createProduct, 
    getProducts,
    archiveProduct, 
    activateProduct, 
    getActiveProducts,
    getProduct,
    updateProduct,
    createReview,
    replyToProductReview,
    deleteProductImages
} = require("../controllers/product");


const { verify, verifyAdmin, checkSuccessfulPurchase } = require("../auth");

const router = express.Router();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDINARYSECRET,
  debug: true, // Enable Cloudinary debugging
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads', // Cloudinary folder for uploads
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

// const storage = multer.memoryStorage(); // Use memory storage for multipart form data
const upload = multer({ storage: storage });



//Create a Product (Admin Only)
// router.post("/add-product", verify, verifyAdmin, createProduct); 
// router.post("/add-product", verify, verifyAdmin, upload.single("image"), createProduct);

router.post("/add-product", verify, verifyAdmin, upload.fields([
    { name: 'imagesUrl', maxCount: 5 } // For additional images, adjust maxCount as needed
  ]), createProduct);

 // Update a Single Product
 router.put("/:productId", verify, verifyAdmin, upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'newImages', maxCount: 5 }, // Adjust maxCount as needed
]), updateProduct);

  

// Route to delete main image and images of a product
router.delete("/:productId/images", verify, verifyAdmin, deleteProductImages);

// Archive Product
router.put("/:productId/archive", verify, verifyAdmin, archiveProduct); 

//Activate Product
router.put("/:productId/activate", verify, verifyAdmin, activateProduct); 


// Update a Single Product
// router.put("/:productId", verify, verifyAdmin, upload.fields([
//   { name: 'mainImage', maxCount: 1 },
//   { name: 'images', maxCount: 5 } // Adjust maxCount as needed
// ]), updateProduct); 

router.get("/all", getProducts); // Retrieve All Products
router.get("/", getActiveProducts); // Retrieve All Active Products
router.get("/:productId", getProduct);// Retrieving Single Product

// User reviews
router.post("/:productId", verify, checkSuccessfulPurchase, createReview);

// Admin reply to a user review
router.put("/:productId/:userId", verify, verifyAdmin, replyToProductReview);

module.exports = router;