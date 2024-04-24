const cloudinary = require("cloudinary").v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Product = require("../models/Product");



          

/**
 * @route   POST /products
 * @desc    Create new product
 * @access  Private (admin authentication required)
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stocks, sku } = req.body;
    const additionalImages = req.files.imagesUrl; // Corrected access to the images array

    if (!name || !description || !price || !stocks || !sku) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!additionalImages) {
      return res.status(400).json({ success: false, message: "No additional images were provided" });
    }

    // Upload additional images to Cloudinary
    const imageResults = await Promise.all(
      additionalImages.map(async (image) => {
        const imageResult = await cloudinary.uploader.upload(image.path);
        return imageResult.secure_url;
      })
    );

    // Create a new product with the uploaded images
    const newProduct = new Product({
      name,
      description,
      price,
      stocks,
      sku,
      imagesUrl: imageResults,
    });

    // Save the product to the database
    const productSaved = await newProduct.save();

    if (productSaved) {
      res.status(201).json({ success: true, message: "Product created successfully" });
    } else {
      res.status(500).json({ success: false, message: "Failed to create the product" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};







  // const createProduct = async (req, res) => {
  //   try {
  //     const { name, description, price, stocks, sku } = req.body;
  
  //     // Get the main image and images from the request
  //     const mainImage = req.files['mainImage'][0].path; // Assuming 'mainImage' is the field name for the main image
  //     const imageFiles = req.files['images']; // Assuming 'images' is the field name for the array of images
  
  //     // Extract image paths from the uploaded files
  //     const images = imageFiles.map((file) => file.path);
  
  //     const newProduct = new Product({
  //       name,
  //       description,
  //       price,
  //       stocks,
  //       sku,
  //       mainImage,
  //       images,
  //     });
  
  //     const productSaved = await newProduct.save();
  //     if (productSaved) {
  //       res.send(true);
  //     } else {
  //       return false;
  //     }
  //   } catch (error) {
  //     res.status(500).send("Internal Server Error");
  //   }
  // };


   /**
   * @route   DELETE /:productId/images
   * @desc    Delete product images
   * @access  Private (admin authentication required)
   */

  const deleteProductImages = async (req, res) => {
    try {
      const { productId } = req.params;
    
      // Find the product by its ID
      const product = await Product.findById(productId);
    
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
    
      // Delete the main image file
      if (product.mainImage) {
        // Remove the main image file (you may need to adjust the path)
        fs.unlinkSync(product.mainImage);
        product.mainImage = "";
      }
    
      // Delete the additional images files
      if (product.images && product.images.length > 0) {
        product.images.forEach((imagePath) => {
          // Remove each additional image file (you may need to adjust the path)
          fs.unlinkSync(imagePath);
        });
        product.images = [];
      }
    
      // Save the product with the updated image fields
      await product.save();
    
      res.json({ message: "Main image and images deleted successfully" });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  };
  
  



// const createProduct = async(req, res) => {
//     try {
//         const { name, description, price, stocks, sku } = req.body;
        
//         const newProduct = new Product({
//             name, 
//             description,
//             price,
//             stocks,
//             sku
//         });

//         const productSaved =  await newProduct.save();
//         if(productSaved) res.send(true);
//         else return false;
//     }catch(error) {
//         res.status(500).send("Internal Server Error");
//     }


// };



/**
 * @route   GET /products/all
 * @desc    Get all products (including active and archive) with pagination
 * @access  Public
 */
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Current page, default to 1
        const limit = parseInt(req.query.limit) || 100; // Number of products per page, default to 10

        const skip = (page - 1) * limit;

        const products = await Product.find({})
            .skip(skip)
            .limit(limit);

        const totalProducts = await Product.countDocuments();

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }

        res.json({
            products: products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
        });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
};


/**
 * @route   GET /products/:productId
 * @desc    Get all products (including active and archive)
 * @access  Public
 */
const getProduct = async (req, res) => {
    try{
        const product = await Product.findById(req.params.productId);
        if(product) res.send(product);
        else res.send("Product Not Found");
    }catch(err) {
        res.status(500).send("Internal Server Error");
    }
};

/**
 * @route   PUT /products/:id/archive
 * @desc    Soft delete a product
 * @access  Private (admin authenticated required)
 */
const archiveProduct = async(req, res) => {
    try {
        let updateActiveField = {
            isActive: false
        };

        let updateIsActiveToFalse = await Product.findByIdAndUpdate(req.params.productId, updateActiveField);
        updateIsActiveToFalse ? res.send(true) : res.send(false);
    }catch(err) {
        res.send(err);
    }

};

/**
 * @route   PUT /products/:id/activate
 * @desc    Activate a product
 * @access  Private (admin authenticated required)
 */
const activateProduct = async(req, res) => {
    try {
        let updateActiveField = {
            isActive: true
        };
        
        let updateIsActiveToTrue = await Product.findByIdAndUpdate(req.params.productId, updateActiveField);
        updateIsActiveToTrue ? res.send(true) : res.send(false);
    }catch(err) {
        res.send(err);
    }

};

/**
 * @route   GET /products
 * @desc    Get all active products
 * @access  Public
 */
const getActiveProducts = async (req, res) => {
    try {
        const activeProducts = await Product.find({isActive: true});
        if(activeProducts.length > 0) return res.send(activeProducts);
        else res.send("No Active Product Exists");
    }catch(err) {
        res.send(err);
    }
};

/**
 * @route   PUT /products/:productId
 * @desc    Update details of a product
 * @access  Private (admin authenticated required)
 */

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, stocks, sku } = req.body;
    const { images, newImages } = req.files;
    const removedImages = req.body.removedImages;
    // const removedImages = JSON.parse(req.body.removedImages);



    if (removedImages !== undefined) {
      console.log("removedImages akie:", removedImages);
    } else {
      console.log("No removed images received");
    }
    console.log("removedImages akie:", removedImages)

    console.log("req.files: ", req.files)
    // const newImages = req.files.newImages; // Retrieve new images

    console.log('Request Headers:', req.headers);
    console.log('Request Body:', req.body);
    console.log("Request Body:", req.body);


    const product = {
      name,
      description,
      price,
      stocks,
      sku,
    };

    try {
      if (removedImages && removedImages.length > 0) {
        for (const removedImageId of removedImages) {
          // Add the folder name "uploads" to the public ID
          const cloudinaryPublicId = `${removedImageId}`;
          console.log("Deleting image with public ID:", cloudinaryPublicId);
    
          // Delete the image using the modified public ID
          const deletionResponse = await cloudinary.uploader.destroy(cloudinaryPublicId);
          console.log("Deletion response:", deletionResponse);
        }
      }
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
    }
    

    // If new images are uploaded, add their public URLs to the product
    // if (newImages && newImages.length > 0) {
    //   product.imagesUrl = newImages.map((image) => image.path);
    // } else {
    //   // If no new images, use the existing ones
    //   product.imagesUrl = images.map((image) => image.path);
    // }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.productId,
      product,
      { new: true }
    );

    if (updatedProduct) {
      return res.json(true);
    } else {
      return res.json(false);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Internal Server Error');
  }
};


// const updateProduct = async (req, res) => {
//     try {
//       const { name, description, price, stocks, sku } = req.body;
//       const { mainImage, images } = req.files; // Access uploaded files
  
//       const product = {
//         name,
//         description,
//         price,
//         stocks,
//         sku,
//       };
  
//       if (mainImage) {
//         product.mainImage = mainImage[0].filename; // Store the filename in the product
//       }
  
//       if (images) {
//         product.images = images.map((image) => image.filename); // Store an array of filenames in the product
//       }
  
//       console.log('Product:', product);
//       console.log('Product ID:', req.params.productId);
  
//       const updatedProduct = await Product.findByIdAndUpdate(
//         req.params.productId,
//         product,
//         { new: true }
//       );
  
//       if (updatedProduct) {
//         return res.json(true);
//       } else {
//         return res.json(false);
//       }
//     } catch (error) {
//       console.error(error);
//       return res.status(500).send('Internal Server Error');
//     }
//   };


// const updateProduct = async (req, res) => {
//     try {
//         const { name, description, price, stocks, sku } = req.body;
//         let product = {
//             name, 
//             description, 
//             price,
//             stocks,
//             sku
//         };

//         console.log("Product: ", product);
//         console.log("Product ID:", req.params.productId);

//         let updatedProduct = await Product.findByIdAndUpdate(req.params.productId, product, { new: true });

//         if (updatedProduct) {
//             return res.json(true);
//         } else {
//             return res.json(false);
//         }
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send("Internal Server Error");
//     }
// };

  


/**
 * @route   POST /:productId
 * @desc    Leave a reviews and rate purchased product
 * @access  Private (authentication and successful purhased required)
 */

const createReview = async (req, res) => {
    try {
      const userId = req.user.id; 
      const productId = req.params.productId;
      const { rating, reviewText } = req.body;
  
      // Find the product by ID
      const product = await Product.findById(productId);
  
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Create a new review object
      const review = {
        userId,
        rating,
        reviewText,
        createdAt: new Date(),
        adminReply: null, // Initialize admin reply as null
      };
  
      // Push the review into the product's reviews array
      product.reviews.push(review);
  
      // Save the updated product with the new review
      await product.save();
  
      return res.status(201).send(true);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };



  /**
 * @route   PUT /:productId/:userId
 * @desc    Reply to a user review
 * @access  Private (admin authentication required)
 */

const replyToProductReview = async (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.params.userId; // Use userId instead of reviewId
        const { adminReply } = req.body;

        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) {
            console.error("Product not found:", productId);
            return res.status(404).json({ message: "Product not found" });
        }

        // Find the review within the product's reviews array by user ID
        const review = product.reviews.find((r) => r.userId.toString() === userId); // Use userId instead of reviewId

        if (!review) {
            console.error("Review not found:", userId); // Use userId instead of reviewId
            return res.status(404).json({ message: "Review not found" });
        }

        // Check if the user making the request is an admin
        const isAdmin = req.user.isAdmin;
        console.log("User is admin:", isAdmin);

        if (!isAdmin) {
            console.error("Unauthorized access - User is not an admin");
            return res.status(403).json({ message: "Only admins can reply to reviews" });
        }

        // Update the admin reply field of the review
        review.adminReply = adminReply;

        // Save the updated product with the admin reply
        await product.save();

        return res.status(200).send(true);
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
  
  
  
  


module.exports = {
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
};