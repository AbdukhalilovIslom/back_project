import express from "express";
import Collection from "../models/Collection.js";

const app = express();

app.post("/collection/create", async (req, res) => {
  const { name, image, theme_id } = req.body;

  const collection = new Collection({
    name,
    theme_id,
    image,
    items: [],
  });

  await collection.save();
  res.status(200).json(collection);
});

app.get("/collections", async (req, res) => {
  try {
    const collections = await Collection.find();
    res.json(collections);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.delete("/collection/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const collection = await Collection.findByIdAndRemove(id);
    if (!collection) {
      return res.status(404).send("not found");
    }
    res.status(200).json(await Collection.find());
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});

app.put("/collection/update/:id", async (req, res) => {
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
});

export default app;
