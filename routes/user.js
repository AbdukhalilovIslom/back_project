import { Router } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateUserToken } from "../services/token.js";
import auth from "../middleware/auth.js";
import Item from "../models/Item.js";
import Collection from "../models/Collection.js";

const router = Router();

const regUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existUser = await User.findOne({ email });
  if (existUser) {
    return res.status(400).send({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    name: name,
    email: email,
    password: hashedPassword,
    role: role,
  });

  await user.save();
  const token = generateUserToken(user._id);
  res.status(200).json({ user, token });
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
const getUsersName = async (req, res) => {
  try {
    const users = await User.find().select("name");

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const info = async (req, res) => {
  try {
    const users = await User.findById(req.user._id);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Fill inputs.");
  }
  const existUser = await User.findOne({ email });
  if (!existUser) {
    return res.status(400).send({ message: "register" });
  }
  const isPassEqual = await bcrypt.compare(password, existUser.password);
  if (!isPassEqual) {
    return res.status(400).send({ message: "Incorrect password!" });
  }
  const token = generateUserToken(existUser._id);
  res.status(200).send({ existUser, token });
};

const userUpdateRole = async (req, res) => {
  try {
    if (req.user.role == "admin") {
      const userId = req.params.id;
      const { role } = req.body;
      const updatedRole = await User.findByIdAndUpdate(
        userId,
        {
          role,
        },
        { new: true }
      );
      res.json({
        message: "User role updated successfully",
        user: updatedRole,
      });

      if (!updatedRole) {
        return res.status(404).send("User not found");
      }
    } else {
      return res.status(404).send("You are not admin");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const userUpdateStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    const updatedRole = await User.findByIdAndUpdate(
      userId,
      {
        status,
      },
      { new: true }
    );
    res.json({
      message: "User role updated successfully",
      user: updatedRole,
    });

    if (!updatedRole) {
      return res.status(404).send("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    await Item.deleteMany({ userId });
    await Collection.deleteMany({ userId });

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User and associated data deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

router.route("/register").post(regUser);
router.route("/login").post(loginUser);
router.get("/info", auth, info);
router.put("/update/role/:id", auth, userUpdateRole);
router.put("/update/status/:id", auth, userUpdateStatus);
router.get("/allusers", auth, getUsers);
router.delete("/delete/:id", auth, deleteUser);
router.get("/allusersname", getUsersName);

export default router;
