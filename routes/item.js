import { Router } from "express";
import Item from "../models/Item.js";
import auth from "../middleware/auth.js";

const router = Router();

const getAllItems = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
const getMyItems = async (req, res) => {
  if (req.user && req.query.id) {
    const userId = req.user.userId;
    const collection_id = req.query.id;

    try {
      const items = await Item.find({ userId, collection_id });
      res.json(items);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  } else {
    res.status(401).send({ message: "not found" });
  }
};

const create = async (req, res) => {
  if (req.user) {
    const { name, collection_id, tag } = req.body;
    const userId = req.user.userId;
    const newItem = new Item({
      name,
      collection_id,
      tag,
      userId,
    });

    await newItem.save();
    res.status(200).json(newItem);
  } else {
    res.status(401).send({ message: "not authed" });
  }
};

const deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Item.findByIdAndRemove(id);
    if (!item) {
      return res.status(404).send("not found");
    }

    res.status(200).json({ message: "Item deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const updateItem = async (req, res) => {
  try {
    const Id = req.params.id;
    const { name, tag } = req.body;

    const updated = await Item.findByIdAndUpdate(
      Id,
      {
        name,
        tag,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).send("not found");
    }

    res.status(200).send({ message: "Item updated" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const like = async (req, res) => {
  const userId = req.user.userId;
  const itemId = req.body.itemId;

  try {
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).send("Item not found");
    }

    const isLiked = item.likes.includes(userId);

    if (isLiked) {
      const result = await Item.findByIdAndUpdate(
        itemId,
        {
          $pull: { likes: userId },
        },
        {
          new: true,
        }
      ).exec();

      res.json(result);
    } else {
      const result = await Item.findByIdAndUpdate(
        itemId,
        {
          $push: { likes: userId },
        },
        {
          new: true,
        }
      ).exec();

      res.json(result);
    }
  } catch (err) {
    return res.status(422).json({ error: err.message });
  }
};

const unlike = async (req, res) => {
  Item.findByIdAndUpdate(
    req.body.itemId,
    {
      $pull: { likes: req.user.userId },
    },
    {
      new: true,
    }
  ).catch((err) => {
    if (err) {
      return res.status(422).json({ error: err });
    } else {
      res.json(result);
    }
  });
};

router.get("/allitems", getAllItems);
router.get("/myitems", auth, getMyItems);
router.post("/create", auth, create);
router.delete("/delete/:id", auth, deleteItem);
router.put("/update/:id", auth, updateItem);
router.put("/like", auth, like);
router.put("/unlike", auth, unlike);

export default router;
