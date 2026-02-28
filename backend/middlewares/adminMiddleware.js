const userSchema = require("../schemas/userModel");

module.exports = async (req, res, next) => {
    try {
        const user = await userSchema.findById(req.userId);
        if (!user || user.type !== "Admin") {
            return res.status(403).send({
                success: false,
                message: "Forbidden: Admin access required",
            });
        }
        next();
    } catch (error) {
        console.error("Admin middleware error:", error);
        res.status(500).send({ message: "Internal server error", success: false });
    }
};
