import { Router } from "express";
import Collection from "../models/Collection.js";
import Item from "../models/Item.js";
import auth from "../middleware/auth.js";
import checkUserStatus from "../middleware/checkUserStatus.js";

const router = Router();

const create = async (req, res) => {
  const { name, image, theme_id } = req.body;
  const userId = req.user._id;
  if (name && theme_id && userId) {
    const collection = new Collection({
      name,
      theme_id,
      image,
      userId,
    });

    await collection.save();
    res.status(200).json(collection);
  } else {
    res.status(404).json({ message: "Not found" });
  }
};

const edit = async (req, res) => {
  try {
    const Id = req.params.id;
    const { name, theme_id, image } = req.body;

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

    const collectionsNew = await Promise.all(
      collections.map(async (collection) => {
        const items = await Item.find({ collection_id: collection._id });
        return {
          collection: {
            ...collection.toObject(),
          },
          itemCount: items.length,
        };
      })
    );

    res.json(collectionsNew);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const getTopCollections = async (req, res) => {
  try {
    const collections = await Collection.find();

    const collectionsWithItems = await Promise.all(
      collections.map(async (collection) => {
        const items = await Item.find({ collection_id: collection._id });
        return {
          collection: {
            ...collection.toObject(),
            items,
          },
          itemCount: items.length,
        };
      })
    );

    const sortedCollections = collectionsWithItems.sort(
      (a, b) => b.itemCount - a.itemCount
    );

    const topFiveCollections = sortedCollections.slice(0, 5);
    res.json(topFiveCollections);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const getMyCollections = async (req, res) => {
  try {
    const userId = req.user._id;
    const collections = await Collection.find({ userId });

    const collectionsNew = await Promise.all(
      collections.map(async (collection) => {
        const items = await Item.find({ collection_id: collection._id });
        return {
          collection: {
            ...collection.toObject(),
          },
          itemCount: items.length,
        };
      })
    );

    res.json(collectionsNew);
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

const searchCollections = async (req, res) => {
  try {
    const { query } = req.query;
    let collections = await Collection.find();

    if (query) {
      const regex = new RegExp(query, "i");
      collections = collections.filter((collection) =>
        regex.test(collection.name)
      );
    }

    const collectionsNew = await Promise.all(
      collections.map(async (collection) => {
        const items = await Item.find({ collection_id: collection._id });
        return {
          collection: {
            ...collection.toObject(),
          },
          itemCount: items.length,
        };
      })
    );

    res.json(collectionsNew);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

router.post("/create", auth, checkUserStatus, create);
router.put("/update/:id", auth, checkUserStatus, edit);
router.get("/allcollections", getAllCollections);
router.get("/topcollections", getTopCollections);
router.get("/mycollections", auth, getMyCollections);
router.get("/search", auth, searchCollections);
router.delete("/delete/:id", auth, checkUserStatus, delCollection);
router.get("/view/:id", auth, collectionView);

export default router;
