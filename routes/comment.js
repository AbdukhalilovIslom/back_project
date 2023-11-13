import { Router } from "express";
import Comment from "../models/Comment.js";
import auth from "../middleware/auth.js";

const router = Router();

const getComment = async (req, res) => {
  try {
    const itemId = req.params.id;
    const items = await Comment.find({ itemId });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const create = async (req, res) => {
  if (req.user) {
    const itemId = req.params.id;
    const { comment } = req.body;
    const userId = req.user.userId;
    const newComm = new Comment({
      comment,
      userId,
      itemId,
    });

    await newComm.save();
    res.status(200).json(newComm);
  } else {
    res.status(401).send({ message: "not authed" });
  }
};

const deleteComm = async (req, res) => {
  try {
    const id = req.params.id;
    const comment = await Comment.findByIdAndRemove(id);
    if (!comment) {
      return res.status(404).send("not found");
    }

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const updateComment = async (req, res) => {
  try {
    const Id = req.params.id;
    const { comment } = req.body;

    const updated = await Comment.findByIdAndUpdate(
      Id,
      {
        comment,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).send("not found");
    }

    res.status(200).send({ message: "Comment updated" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

router.post("/create/:id", auth, create);
router.get("/:id", getComment);
router.delete("/delete/:id", auth, deleteComm);
router.put("/update/:id", auth, updateComment);

export default router;
