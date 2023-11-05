import { Schema, model } from "mongoose";

export const ItemSchema = new Schema({
  name: { type: String, required: true },
  collection_id: { type: String, required: true },
});

const Item = model("Item", ItemSchema);
export default Item;
