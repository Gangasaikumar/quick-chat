import mongoose from "mongoose";
import type { IUser } from "./schemaInterfaces.ts";

const userSchema = new mongoose.Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, minLength:6, required: true },
    profilePic: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

userSchema.set("toJSON", {
  transform: (_doc, ret: Partial<IUser>) => {
    delete ret.password;
    return ret;
  },
});

// const Users = mongoose.model("users", userSchema); wht thias commented i am not taking default db
export { userSchema };
