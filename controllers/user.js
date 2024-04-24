const User = require("../models/User");
const bcrypt = require("bcrypt");
const { createAccessToken } = require("../auth");


// Check if the email already exits
// To be used in the 'registerUser' function
const checkEmailExists = async (req, res) => {
    try {
        const result = await User.find({ email: req.body.email });
        if (result.length > 0) {
            return false;
        } else {
            return true;
        }
    } catch (error) {
        res.send(error.message);
    }
};

/**
 * @route   POST /users/register
 * @desc    Register a User
 * @access  Public
 */
const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, mobileNo } = req.body;

    try {
        const userEmailExists = await checkEmailExists(req, res);
        

        if (!userEmailExists) {
            return res.send("Email Exists.");
        } else {
            const newUser = new User({
                firstName,
                lastName,
                email,
                password: bcrypt.hashSync(password, 10),
                mobileNo,
            });

            const user = await newUser.save();
            res.send(true);
        }
    } catch (err) {
        return res.send(err.message);
    }
};




/**
 * @route   GET /users
 * @desc    Get all users
 * @access  Private (Admin authentication required)
 */
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users);
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: "Internal Server Error" });
    }
};




/**
 * @route   POST /users/login
 * @desc    Login User
 * @access  Public
 */


// const loginUser = (req, res) => {
// 	return User.findOne({email: req.body.email}).then(result => {

// 			// If user does not exists
// 			if(result == null) {
// 				return res.json(false);
// 			} else {
// 				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
// 				if(isPasswordCorrect) {
// 					res.json({
// 						access: auth.createAccessToken(result)
// 					});
// 				} else {
// 					return res.json(false);
// 				}
// 			}

// 	})
// }

// const loginUser = async (req, res) => {
//     try {
//         const result = await User.findOne({ email: req.body.email });

//         if(result) {
//             const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
//             if(isPasswordCorrect) {
//                 res.send({
//                     access: createAccessToken(result)
//                 })
//             }else {
//                 console.log(error);
//                 return res.json(false);
//             }
//         }
//         else {
//             return res.json(false);
//         }
//     }catch(error) {
//         console.log(error);
//         return false;
//     }

// };



const loginUser = async (req, res) => {
    try {
        const result = await User.findOne({ email: req.body.email });

        if (result) {
            const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
            if (isPasswordCorrect) {
                res.send({
                    access: createAccessToken(result)
                });
            } else {
                // Incorrect password
                res.status(401).json({ error: "Invalid password" });
            }
        } else {
            // User not found
            res.status(401).json({ error: "User not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};


/**
 * @route   GET /users/details
 * @desc    View user profile
 * @access  Private (authentication required)
 */
const getProfile = async (req, res) => {
    try {
        const result = await User.findById(req.user.id);
        if (result) {
            // Hide password
            result.password = "";
            res.send(result);
        } else {
            res.status(404).send("User Not Found");
        }
    } catch (err) {
        res.status(500).send("Internal Server Error");
    };
};


/**
 * @route   PUT /:id/updateProfile
 * @desc    Update user profile
 * @access  Private (authentication required)
 */

const updateProfile = async (req, res) => {
    try {
        // Exclude the 'password' property from req.body
        const { password, ...updateData } = req.body;

        const updatedProfile = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (updatedProfile) {
            return res.send(true);
        } else {
            return res.send(false);
        }
    } catch (err) {
        res.status(500).send(err);
    }
};



// const updateProfile = async (req, res) => {
//     try{
//         const updatedProfile = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});

//         if(updatedProfile) return res.send(true);
//         else res.send(false);
//     }catch(err) {
//         res.status(500).send(err);
//     }
// };

/**
 * @route   PUT /
 * @desc    Update non-admin user to admin user
 * @access  Private (admin authentication required)
 */
const updateUserAsAdmin = async (req, res) => {
    try {
        // Find the user by their ID
        const user = await User.findById(req.body.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isAdmin) {
            return res.send("User is already an admin");
        }

        // Update the user's role to admin
        user.isAdmin = true;

        // Save the updated user
        await user.save();

        return res.status(200).send(true);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


/**
 * @route   PUT /users/change-password
 * @desc    Change password
 * @access  Private (authentication required)
 */

const changePassword = async (req, res) => {
   
    const userId = req.user.id;

    // Extract the old and new passwords from the request body
    const { oldPassword, newPassword } = req.body;

    // Check if the old password matches the one in the database (you'll need to fetch the user's data)
    const user = await User.findById(userId); // Replace User with your User model


    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if the old password matches using bcrypt
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Old password is incorrect' });
    }

    // Hash the new password before storing it
    const saltRounds = 10; // You can adjust this for the desired level of security
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password with the new hashed password
    user.password = hashedNewPassword; // Replace 'password' with the field name for the password in your User model

    // Save the updated user document
    await user.save();

    // Send a success response
    res.status(200).json({ message: 'Password updated successfully' });
};




module.exports = {
    checkEmailExists, registerUser, loginUser, getProfile, updateProfile, updateUserAsAdmin, getUsers, changePassword
};