const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers["authorization"];
    if (!authorizationHeader) {
      return res
        .status(401)
        .send({ message: "Authorization header missing", success: false });
    }

    const token = authorizationHeader.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .send({ message: "Token missing from header", success: false });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, decode) => {
      if (err) {
        return res
          .status(401)
          .send({ message: "Token is not valid or has expired", success: false });
      }

      // Store userId in BOTH req.userId and req.body.userId
      // req.userId is the reliable one (works for GET, POST, multipart, etc.)
      req.userId = decode.id;

      // For backward compat: also set on req.body if it exists
      if (req.body && typeof req.body === "object") {
        req.body.userId = decode.id;
      }

      next();
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).send({ message: "Internal server error", success: false });
  }
};
