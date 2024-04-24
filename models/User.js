const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: [true, "First name is required"],
	},
	lastName: {
		type: String,
		required: [true, "Last name is required"],
	},
	email: {
		type: String,
		required: [true, "Email is required"],
	},
	password: {
		type: String,
		required: [true, "Password is required"],
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
	mobileNo: {
		type: String,
		required: [true, "Mobile number is required"],
	},
	street: String,
	country: String,
	province: String,
	city: String,
	postalcode: String,
}, {
	timestamps: true // Enable the timestamps option
});

module.exports = mongoose.model("User", userSchema);
