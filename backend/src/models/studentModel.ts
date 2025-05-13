import { Schema, model, Types, Document } from "mongoose";
import { INotification, NotificationSchema } from "./NotificationSchema.js";
import { CartSchema, ICart } from "./cartModel.js";


export interface IStudent extends Document {
  _id: Types.ObjectId;
  role: "student";
  fullName: string;
  gender: string;
  picture: string;
  username: string;
  googleSignIn: boolean;
  emailVerified: boolean;
  isVerified: boolean;
  email: string;
  password?: string;
  notifications: INotification[];
  refreshToken?: string;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordUpdateToken?: string;
  passwordUpdateTokenExpiry?: Date;
  cartItems: ICart[];
  assignments: Types.ObjectId[];
  enrolledCourses: Types.ObjectId[];
  instructors: Types.ObjectId[];
}

const StudentSchema = new Schema<IStudent>(
  {
    role: { type: String, default: "student" },
    fullName: { type: String, required: true },
    gender: { type: String, default: "other" },
    picture: {
      type: String,
      default:
        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    },
    username: { type: String, unique: true, sparse: true },
    googleSignIn: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordUpdateToken: String,
    passwordUpdateTokenExpiry: Date,
    email: { type: String, required: true, unique: true },
    password: String,
    notifications: { type: [NotificationSchema], default: [] },
    cartItems: { type: [CartSchema], default: [] },
    instructors: {
      type: [Schema.Types.ObjectId],
      ref: "instructor",
      default: [],
    },
    assignments: {
      type: [Schema.Types.ObjectId],
      ref: "assignment",
      default: [],
    },
    enrolledCourses: {
      type: [Schema.Types.ObjectId],
      ref: "course",
      default: [],
    },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

StudentSchema.pre<IStudent>("save", async function (next) {
  if (!this.username && this.email) {
    const base = this.email.split("@")[0];
    let candidate = base;
    let count = 1;

    while (await model<IStudent>("student").exists({ username: candidate })) {
      candidate = `${base}${count++}`;
    }
    this.username = candidate;
  }

  if (!this.googleSignIn && !this.password) {
    return next(new Error("Password is required for email/password signups"));
  }

  if (this.googleSignIn) this.emailVerified = true;

  next();
});

export default model<IStudent>("student", StudentSchema);
