const Order = require("./models/Order");

const jwt = require("jsonwebtoken");

// Secret
const secret = "MarketHub";

const createAccessToken = (user) => {
    // const { _id, email, isAdmin } = user;
    // When the user logs in, a token will be generated with user's information
    const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	}

    // Generate a JSON web token using the jwt's sign method
	// Generates the token using the form data and the secret code with no additional optios provided
	// data = payload, secret = secret(signature), {} = options(currently none)
    return jwt.sign(data, secret, {});
}

const verify = (req, res, next) => {
    console.log(req.headers.authorization);

    let token = req.headers.authorization;
    if(typeof token === "undefined") {
        return res.send({
            auth: "Failed. No token"
        });
    } else {
        // To remove the "Bearer " character from the auth header
        token = token.slice(7, token.length);

        // Validate the token using the "verify" method decrypting the token using the secret code
        jwt.verify(token, secret, function(err, decodedToken){
            if(err) {
                // return res.send({
                //     auth: "Failed",
                //     message: err.message
                // })
                return res.send(false);
            } else {
                // user property will be added to request object and will contain our decodedToken
                req.user = decodedToken;

                // middleware function
				// next() will let us proceed to the next middleware or controller
                next();
            }
        })
    }
}


// const verifyAdmin = (req, res, next) => {
//     try {
//         req.user.isAdmin ? next() : res.send(false);
//     } catch (error) {
//         console.log(error);
//         return res.json("Internal Server Error", error);
//     };
// };


const verifyAdmin = (req, res, next) => {
    try {
        if (req.user && req.user.isAdmin) {
            next(); // User is an admin, proceed to the next middleware
        } else {
            res.status(403).json({ message: "Unauthorized. Admin access required." });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



// Middleware to check if a user has made a successful purchase
const checkSuccessfulPurchase = async (req, res, next) => {
    try {
      const userId = req.user.id;
  
      // Check if the user has made a successful purchase
      const orders = await Order.find({ userId, status: 'Delivered' });
  
      if (orders.length === 0) {
        return res.status(403).json({ message: "Only users with successful purchases can leave reviews" });
      }
  
      // User has made a successful purchase, allow them to leave a review
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  


module.exports = {
    createAccessToken, verify, verifyAdmin, checkSuccessfulPurchase
}