const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const {
    getAllUsersController,
    handleStatusController,
    getAllPropertiesController,
    getAllBookingsController
} = require("../controller/adminController");

const router = express.Router();

// All routes here require both a valid token AND Admin role
router.get('/getallusers', authMiddleware, adminMiddleware, getAllUsersController);
router.post('/handlestatus', authMiddleware, adminMiddleware, handleStatusController);
router.get('/getallproperties', authMiddleware, adminMiddleware, getAllPropertiesController);
router.get('/getallbookings', authMiddleware, adminMiddleware, getAllBookingsController);

module.exports = router;
