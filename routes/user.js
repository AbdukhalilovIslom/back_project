import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateUserToken } from "../services/token.js";

const app = express();
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).send("User already exists");
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
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.delete("/user/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByIdAndRemove(id);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(await User.find());
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Fill inputs.");
  }
  const existUser = await User.findOne({ email });
  if (!existUser) {
    return res.status(400).send("User already exist");
  }
  const isPassEqual = await bcrypt.compare(password, existUser.password);
  if (!isPassEqual) {
    return res.status(400).send("Incorrect password!");
  }
  const token = generateUserToken(existUser._id);
  res.status(200).send({ token });
});

app.put("/users/update/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, role, email, password } = req.body;

    // Find the user by ID and update the fields
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        role,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.status(200).send(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.delete("/users/delete", async (req, res) => {
  try {
    const { ids } = req.body;

    // Check if the request contains IDs to delete
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).send("Please provide valid user IDs to delete");
    }

    // Delete users based on the array of IDs
    const deletionResult = await User.deleteMany({ _id: { $in: ids } });

    if (deletionResult.deletedCount === 0) {
      return res.status(404).send("Users not found");
    }

    res.status(200).send(await User.find());
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

export default app;
