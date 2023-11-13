import { Schema, model } from "mongoose";

const CommentSchema = new Schema(
  {
    userId: { type: String, required: true },
    itemId: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const Comment = model("Comment", CommentSchema);
export default Comment;
