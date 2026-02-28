const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = require("../schemas/userModel");
const propertySchema = require("../schemas/propertyModel");
const bookingSchema = require("../schemas/bookingModel");

//////////for registering/////////////////////////////
const registerController = async (req, res) => {
  try {
    const { email, password, type } = req.body;

    if (!email || !password || !type) {
      return res.status(400).send({ message: "Missing required fields", success: false });
    }

    const existsUser = await userSchema.findOne({ email });
    if (existsUser) {
      return res.status(409).send({ message: "User already exists", success: false });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userSchema({
      ...req.body,
      password: hashedPassword,
      granted: type === "Owner" ? "ungranted" : undefined
    });

    await newUser.save();
    return res.status(201).send({ message: "Registration successful", success: true });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};

////for the login
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Invalid email or password", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: "1d" });

    // Security: exclude password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).send({
      message: "Login successful",
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};

/////forgotting password
const forgotPasswordController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await userSchema.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found", success: false });
    }

    return res.status(200).send({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Forgot PW Error:", error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};

////auth controller
const authController = async (req, res) => {
  try {
    const userId = req.userId; // Use reliable req.userId from authMiddleware
    const user = await userSchema.findById(userId).select("-password");

    if (!user) {
      return res.status(404).send({ message: "User session expired", success: false });
    }

    return res.status(200).send({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(500).send({ message: "Auth error", success: false });
  }
};

/////////get all properties globally
const getAllPropertiesController = async (req, res) => {
  try {
    // Only show available properties or show all for catalog? 
    // Requirement usually implies all for home cards
    const allProperties = await propertySchema.find({}).sort({ createdAt: -1 });
    return res.status(200).send({ success: true, data: allProperties });
  } catch (error) {
    console.error("Get Properties Error:", error);
    return res.status(500).send({ message: "Failed to fetch properties", success: false });
  }
};

///////////booking handle///////////////
const bookingHandleController = async (req, res) => {
  try {
    const { propertyid } = req.params;
    const { userDetails, ownerId } = req.body;
    const userId = req.userId;

    // 1. Check if property exists and is available
    const property = await propertySchema.findById(propertyid);
    if (!property) {
      return res.status(404).send({ success: false, message: "Property no longer exists" });
    }
    if (property.isAvailable === "Unavailable") {
      return res.status(400).send({ success: false, message: "This property is already booked" });
    }

    // 2. Prevent duplicate pending bookings for the SAME user and SAME property
    const existing = await bookingSchema.findOne({
      propertyId: propertyid,
      userID: userId,
      bookingStatus: "pending"
    });

    if (existing) {
      return res.status(409).send({ success: false, message: "You already have a pending request for this property" });
    }

    const booking = new bookingSchema({
      propertyId: propertyid,
      userID: userId,
      ownerID: ownerId,
      userName: userDetails.fullName,
      phone: userDetails.phone,
      bookingStatus: "pending",
    });

    await booking.save();

    return res.status(201).send({
      success: true,
      message: "Booking request sent to owner"
    });
  } catch (error) {
    console.error("Error handling booking:", error);
    return res.status(500).send({ success: false, message: "Failed to process booking" });
  }
};

/////get all bookings for the logged in tenant//////
const getAllBookingsController = async (req, res) => {
  try {
    const userId = req.userId;
    const bookings = await bookingSchema.find({ userID: userId }).sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get Bookings Error:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

module.exports = {
  registerController,
  loginController,
  forgotPasswordController,
  authController,
  getAllPropertiesController,
  bookingHandleController,
  getAllBookingsController,
};
