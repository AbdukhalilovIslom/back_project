import User from "../models/User.js";

async function checkUserStatus(req, res, next) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.status === "active") {
      next();
    } else {
      return res.status(403).json({ message: "User is inactive" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
}

export default checkUserStatus;
