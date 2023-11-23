import { Router } from "express";
import Item from "../models/Item.js";
import auth from "../middleware/auth.js";
import checkUserStatus from "../middleware/checkUserStatus.js";
import Collection from "../models/Collection.js";

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
const getItemsByColl = async (req, res) => {
  try {
    const items = await Item.find({ collection_id: req.params.id });
    const collection = await Collection.findById(req.params.id);
    res.json({ collection: collection, items: items });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
const getMyItems = async (req, res) => {
  if (req.user && req.query.id) {
    const userId = req.user._id;
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
    const userId = req.user._id;
    if (name && collection_id && tag) {
      const newItem = new Item({
        name,
        collection_id,
        tag,
        userId,
      });
      await newItem.save();
      res.status(200).json(newItem);
    } else {
      res.status(400).json({ message: "bad request" });
    }
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

const comment = async (req, res) => {
  try {
    const comment = {
      text: req.body.text,
      postedBy: req.user._id,
    };

    const updated = await Item.findByIdAndUpdate(
      req.body.itemId,
      {
        $push: { comments: comment },
      },
      {
        new: true,
      }
    );

    if (!updated) {
      return res.status(404).send("not found");
    }

    res.status(200).send({ message: "comment added" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
const like = async (req, res) => {
  const userId = req.user._id;
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
  try {
    const result = await Item.findByIdAndUpdate(
      req.body.itemId,
      {
        $pull: { likes: req.user._id },
      },
      {
        new: true,
      }
    );

    if (!result) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
};

const searchItems = async (req, res) => {
  try {
    const { query } = req.query;

    const items = await Item.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { "comments.text": { $regex: query, $options: "i" } },
        { tag: { $regex: query, $options: "i" } },
      ],
    });

    res.json(items);
  } catch (err) {
    res.status(500).send(err);
  }
};

const adminAddItem = async (req, res) => {
  if (req.user.role === "admin") {
    const { name, collection_id, tag, userId } = req.body;
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

const getTags = async (req, res) => {
  const items = await Item.find({}, "tag");
  const uniqueTags = [];

  items.map((el) => {
    el.tag;
  });

  items.forEach((item) => {
    const tags = item.tag.split(" ");
    tags.forEach((tag) => {
      if (!uniqueTags.includes(tag)) {
        if (tag.includes("#")) uniqueTags.push(tag);
      }
    });
  });
  res.json(uniqueTags);
};

router.get("/allitems", getAllItems);
router.get("/tags", getTags);
router.get("/itemsbycoll/:id", getItemsByColl);
router.get("/myitems", auth, getMyItems);
router.get("/search", auth, searchItems);
router.post("/create", auth, checkUserStatus, create);
router.post("/admin/create", auth, checkUserStatus, adminAddItem);
router.delete("/delete/:id", auth, checkUserStatus, deleteItem);
router.put("/update/:id", auth, checkUserStatus, updateItem);
router.put("/like", auth, checkUserStatus, like);
router.put("/unlike", auth, checkUserStatus, unlike);
router.put("/comment", auth, checkUserStatus, comment);

export default router;
