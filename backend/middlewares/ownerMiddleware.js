const userSchema = require("../schemas/userModel");

module.exports = async (req, res, next) => {
    try {
        const user = await userSchema.findById(req.userId);
        if (!user || user.type !== "Owner") {
            return res.status(403).send({
                success: false,
                message: "Forbidden: Owner access required",
            });
        }

        // Check if granted
        if (user.granted !== "granted") {
            return res.status(403).send({
                success: false,
                message: "Your account is pending admin approval.",
            });
        }

        next();
    } catch (error) {
        console.error("Owner middleware error:", error);
        res.status(500).send({ message: "Internal server error", success: false });
    }
};
