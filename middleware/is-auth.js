const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeaders = req.get("Authorization");
  if (!authHeaders) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeaders.split(" ")[1];
  let decodeToken;
  try {
    decodeToken = jwt.verify(token, "tokensupersecret");
  } catch (error) {
    error.statusCode = 500;
    throw error;
  }
  if (!decodeToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodeToken.userId;
  next();
};
