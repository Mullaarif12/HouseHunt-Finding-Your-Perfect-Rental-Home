const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/authMiddleware");
const ownerMiddleware = require("../middlewares/ownerMiddleware");

const {
  addPropertyController,
  getAllOwnerPropertiesController,
  deletePropertyController,
  updatePropertyController,
  getAllBookingsController,
  handleAllBookingstatusController,
} = require("../controller/ownerController");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Add timestamp to avoid collisions
  },
});

const upload = multer({ storage: storage });

router.post(
  "/postproperty",
  authMiddleware,
  ownerMiddleware,
  upload.array("propertyImages"),
  addPropertyController
);

router.get("/getallproperties", authMiddleware, ownerMiddleware, getAllOwnerPropertiesController);

router.get("/getallbookings", authMiddleware, ownerMiddleware, getAllBookingsController);

router.post("/handlebookingstatus", authMiddleware, ownerMiddleware, handleAllBookingstatusController);

router.delete(
  "/deleteproperty/:propertyid",
  authMiddleware,
  ownerMiddleware,
  deletePropertyController
);

router.patch(
  "/updateproperty/:propertyid",
  authMiddleware,
  ownerMiddleware,
  upload.array("propertyImages"),
  updatePropertyController
);

module.exports = router;
