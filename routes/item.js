import express from "express";
import Item from "../models/Item.js";
import Collection from "../models/Collection.js";

const app = express();

app.post("/item/create", async (req, res) => {
  const { name, collection_id } = req.body;
  const collection = await Collection.findById(collection_id);
  const newItem = new Item({
    name,
    collection_id,
  });

  console.log(newItem);

  collection.items.push(newItem);
  await collection.save();
  await newItem.save();
  res.status(200).json(newItem);
});

app.get("/items", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.delete("/item/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { _id, collection_id } = await Item.findById(id);
    const item = await Item.findByIdAndRemove(_id);
    const updatedItems = await Item.find({ collection_id });
    if (!item) {
      return res.status(404).send("not found");
    }

    const collection = await Collection.findById(collection_id);
    collection.items = updatedItems;
    await collection.save();
    res.status(200).json(updatedItems);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.put("/item/update/:id", async (req, res) => {
  try {
    const Id = req.params.id;
    const { name, collection_id } = req.body;

    const updated = await Item.findByIdAndUpdate(
      Id,
      {
        name,
        collection_id,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).send("not found");
    }
    const updatedItems = await Item.find({ collection_id });
    const collection = await Collection.findById(collection_id);
    collection.items = updatedItems;
    await collection.save();
    res.status(200).send(updated);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

export default app;
