const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require('dotenv').config();

const fileupload = require('express-fileupload'); 



// Routes
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const cartRoutes = require("./routes/cart");

const app = express();
const port = 4000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Allows all resources to access our backend application
app.use(cors());

// Connecting to the Database
// Connecting to MongoDB Atlas (cloud)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


console.log("hello World")

let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => console.log("We're connected to the cloud database!"));

// Backend Routes
app.use("/users", userRoutes);
app.use("/products", productRoutes);
// //app.use('/products/uploads', express.static('uploads'));
app.use("/orders", orderRoutes);
app.use("/carts", cartRoutes);

app.use(fileupload({useTempFiles: true}))

// Server Start
if(require.main === module) {
    app.listen(port, () => console.log(`Server running at port ${port}`));
}

module.exports = app;

