import { Router } from "express";
import Collection from "../models/Collection.js";
import Item from "../models/Item.js";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js";

const router = Router();

const create = async (req, res) => {
  const { name, image, theme_id } = req.body;
  const userId = req.user.userId;
  const collection = new Collection({
    name,
    theme_id,
    image,
    userId,
  });

  await collection.save();
  res.status(200).json(collection);
};

const edit = async (req, res) => {
  try {
    const Id = req.params.id;
    const { name, theme_id, image } = req.body;
    console.log(theme_id);

    const updated = await Collection.findByIdAndUpdate(
      Id,
      {
        name,
        theme_id,
        image,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).send("not found");
    }

    res.status(200).send(updated);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const getAllCollections = async (req, res) => {
  try {
    const collections = await Collection.find();
    res.json(collections);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};
const getMyCollections = async (req, res) => {
  try {
    const userId = req.user.userId;
    const collections = await Collection.find({ userId });
    res.json(collections);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const delCollection = async (req, res) => {
  try {
    const id = req.params.id;
    await Item.deleteMany({ collection_id: id });
    const collection = await Collection.findByIdAndRemove(id);
    if (!collection) {
      return res.status(404).send("not found");
    }
    res.status(200).json(await Collection.find());
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const collectionView = async (req, res) => {
  try {
    const id = req.params.id;
    const collections = await Collection.findById(id);
    res.json(collections);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

router.post("/create", auth, create);
router.put("/update/:id", auth, edit);
router.get("/allcollections", getAllCollections);
router.get("/mycollections", auth, getMyCollections);
router.delete("/delete/:id", auth, delCollection);
router.get("/view/:id", auth, collectionView);

export default router;
