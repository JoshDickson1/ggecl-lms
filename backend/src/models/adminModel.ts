import { Document, Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import { INotification, NotificationSchema } from "./NotificationSchema.js";
import { Types } from "mongoose";

export interface IAdmin extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  fullName: string;
  picture: string;
  isVerified: boolean;
  role: "admin";
  permissions: string[];
  notifications: INotification[];
  refreshToken?: string;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordUpdateToken?: string;
  passwordUpdateTokenExpiry?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    isVerified: { type: Boolean, default: false },
    picture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    password: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      default: "admin",
    },
    permissions: {
      type: [String],
      default: [],
    },
    notifications: { type: [NotificationSchema], default: [] },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

AdminSchema.methods.comparePassword = async function (
  this: IAdmin,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default model<IAdmin>("Admin", AdminSchema);
