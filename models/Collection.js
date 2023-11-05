import { Schema, model } from "mongoose";
import Item, { ItemSchema } from "./Item.js";

const CollectionSchema = new Schema({
  name: { type: String, required: true },
  theme_id: { type: Number, required: true },
  image: { type: String, required: true },
  items: {
    type: [ItemSchema],
    required: true,
  },
});

const Collection = model("Collection", CollectionSchema);
export default Collection;
