const propertySchema = require("../schemas/propertyModel");
const userSchema = require("../schemas/userModel");
const bookingSchema = require("../schemas/bookingModel");

/////////getting all users///////////////
const getAllUsersController = async (req, res) => {
  try {
    const allUsers = await userSchema.find({}).sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "All users",
      data: allUsers,
    });
  } catch (error) {
    console.error("Admin GetAllUsers Error:", error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};

/////////handling status for owner/////////
const handleStatusController = async (req, res) => {
  try {
    const { userid, status } = req.body;
    const user = await userSchema.findByIdAndUpdate(
      userid,
      { granted: status },
      { new: true }
    );
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }
    return res.status(200).send({
      success: true,
      message: `User status updated to ${status}`,
    });
  } catch (error) {
    console.error("Admin HandleStatus Error:", error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};

/////////getting all properties in app//////////////
const getAllPropertiesController = async (req, res) => {
  try {
    const allProperties = await propertySchema.find({}).sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "All properties",
      data: allProperties,
    });
  } catch (error) {
    console.error("Admin GetAllProperties Error:", error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};

////////get all bookings////////////
const getAllBookingsController = async (req, res) => {
  try {
    const allBookings = await bookingSchema.find().sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      data: allBookings,
    });
  } catch (error) {
    console.error("Admin GetAllBookings Error:", error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  getAllUsersController,
  handleStatusController,
  getAllPropertiesController,
  getAllBookingsController
};
