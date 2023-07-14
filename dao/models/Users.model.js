import mongoose from "mongoose";

const schema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: String,
  age: Number,
  password: String,
});

const userModel = mongoose.model("users", schema);

export default userModel;
