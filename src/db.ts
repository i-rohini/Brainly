
import mongoose, { model, Schema } from "mongoose";

mongoose.connect("mongodb+srv://rohini2garg1:dWtTJHBy2oMR2Mhd@cluster0.w8pwsdp.mongodb.net/Brainly");

const UserSchema = new Schema({
  username: {type: String, unique: true},
  password: String
})

export const UserModel = model("User", UserSchema);

const ContentSchema = new Schema({
  link: String,
  title: String,
  tags: [{type: mongoose.Types.ObjectId, ref: 'Tag'}],
  userId: {type: mongoose.Types.ObjectId, ref: 'User', required: true }
})

export const ContentModel = model("Content", ContentSchema);