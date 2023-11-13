import jwt from "jsonwebtoken";
import User from "../models/User.js";

function auth(req, res, next) {
  const token = req.headers.authorization.slice(7);
  if (!token) return req.status(401).send({ message: "No Token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    User.findById(decoded.userId).then((res) => {
      const userData = {
        _id: res._id,
        name: res.name,
        email: res.email,
        role: res.role,
      };
      req.user = userData;
      next();
    });
  } catch (err) {
    req.status(400).send({ message: "Invalid Token)" });
  }
}

export default auth;
