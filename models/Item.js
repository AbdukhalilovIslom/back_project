import mongoose, { Schema, model } from "mongoose";
const { ObjectId } = mongoose.Schema.Types;
export const ItemSchema = new Schema(
  {
    name: { type: String, required: true },
    tag: { type: String, required: true },
    collection_id: { type: String, required: true },
    userId: { type: String, required: true },
    likes: [{ type: ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Item = model("Item", ItemSchema);
export default Item;
