const express = require("express");
const { 
    checkEmailExists,
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile,
    updateUserAsAdmin,
    getUsers,
    changePassword 
} = require("../controllers/user");

const { verify, verifyAdmin } = require("../auth");


const router = express.Router();

router.post("/checkEmail", checkEmailExists);
router.post("/register", registerUser); // User Registration
router.get("/", verify, verifyAdmin, getUsers); // Retrieve all users
router.post("/login", loginUser); // User Login
router.put("/:id/updateProfile", verify, updateProfile); // Update Profile (authentication required)
router.put("/change-password", verify, changePassword);


// Update non-admin user to admin user(admin authentication required)
router.put("/", verify, verifyAdmin, updateUserAsAdmin);

router.get("/details", verify, getProfile); // Get profile (authentication required)


module.exports = router;