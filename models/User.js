import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  password: { type: String, required: true },
  role: { type: String },
  status: { type: String, required: true, default: "active" },
});

const User = model("User", UserSchema);
export default User;
