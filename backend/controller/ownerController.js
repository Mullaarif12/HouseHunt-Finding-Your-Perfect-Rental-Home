const bookingSchema = require("../schemas/bookingModel");
const propertySchema = require("../schemas/propertyModel");
const userSchema = require("../schemas/userModel");

//////////adding property by owner////////
const addPropertyController = async (req, res) => {
  try {
    const userId = req.userId; // Use reliable req.userId from authMiddleware
    let images = [];
    if (req.files) {
      images = req.files.map((file) => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
      }));
    }

    const user = await userSchema.findById(userId);
    if (!user) {
      return res.status(401).send({ success: false, message: "Unauthorized: Owner not found" });
    }

    const newPropertyData = new propertySchema({
      ...req.body,
      propertyImage: images,
      ownerId: user._id,
      ownerName: user.name,
      isAvailable: "Available",
    });

    await newPropertyData.save();

    return res.status(201).send({
      success: true,
      message: "Property listed successfully",
    });
  } catch (error) {
    console.error("Error in addPropertyController:", error);
    return res.status(500).send({ success: false, message: "Failed to add property" });
  }
};

///////////all properties of owner/////////
const getAllOwnerPropertiesController = async (req, res) => {
  try {
    const userId = req.userId;
    const properties = await propertySchema.find({ ownerId: userId }).sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error("Error in getAllOwnerPropertiesController:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

//////delete the property by owner/////
const deletePropertyController = async (req, res) => {
  try {
    const { propertyid } = req.params;
    const userId = req.userId;

    // Security check: verify owner
    const property = await propertySchema.findOne({ _id: propertyid, ownerId: userId });
    if (!property) {
      return res.status(403).send({ success: false, message: "Unauthorized to delete this property" });
    }

    await propertySchema.findByIdAndDelete(propertyid);

    // Clean up related bookings? 
    // Senior note: Usually we'd archive, but requirements suggest deletion
    await bookingSchema.deleteMany({ propertyId: propertyid });

    return res.status(200).send({
      success: true,
      message: "Property and associated bookings removed",
    });
  } catch (error) {
    console.error("Error in deletePropertyController:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

//////updating the property/////////////
const updatePropertyController = async (req, res) => {
  try {
    const { propertyid } = req.params;
    const userId = req.userId;

    // Security check
    const existingProperty = await propertySchema.findOne({ _id: propertyid, ownerId: userId });
    if (!existingProperty) {
      return res.status(403).send({ success: false, message: "Unauthorized to update this property" });
    }

    let updateData = { ...req.body };

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
      }));
      updateData.propertyImage = images;
    }

    const updatedProperty = await propertySchema.findByIdAndUpdate(
      propertyid,
      { $set: updateData },
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: "Property updated successfully",
      data: updatedProperty
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update property",
    });
  }
};

const getAllBookingsController = async (req, res) => {
  try {
    const userId = req.userId;
    const bookings = await bookingSchema.find({ ownerID: userId }).sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error in getAllBookingsController:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

//////////handle bookings status//////////////
const handleAllBookingstatusController = async (req, res) => {
  try {
    const { bookingId, propertyId, status } = req.body;
    const userId = req.userId;

    // Verify ownership of the property before status change
    const propertyCheck = await propertySchema.findOne({ _id: propertyId, ownerId: userId });
    if (!propertyCheck) {
      return res.status(403).send({ success: false, message: "Unauthorized action on this property" });
    }

    const booking = await bookingSchema.findByIdAndUpdate(
      bookingId,
      { bookingStatus: status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).send({ success: false, message: "Booking not found" });
    }

    // Toggle availability
    await propertySchema.findByIdAndUpdate(
      propertyId,
      { isAvailable: status === 'booked' ? 'Unavailable' : 'Available' }
    );

    return res.status(200).send({
      success: true,
      message: `Property status updated to ${status === 'booked' ? 'Unavailable' : 'Available'}`,
    });
  } catch (error) {
    console.error("Error in handleAllBookingstatusController:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

module.exports = {
  addPropertyController,
  getAllOwnerPropertiesController,
  deletePropertyController,
  updatePropertyController,
  getAllBookingsController,
  handleAllBookingstatusController,
};
