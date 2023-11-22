import { Schema, model } from "mongoose";

const CollectionSchema = new Schema({
  name: { type: String, required: true },
  theme_id: { type: Number, required: true },
  image: { type: String, required: false, default: null },
  userId: { type: String, required: true },
  items: { type: Object, ref: "Item" },
});

const Collection = model("Collection", CollectionSchema);
export default Collection;
