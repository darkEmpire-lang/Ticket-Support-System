import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.headers.token) {
    token = req.headers.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid Token. Login Again." });
  }
};

export default authUser;
