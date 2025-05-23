import mongoose, { Document, Types } from "mongoose";

interface IGroup extends Document {
  groupId: string;
  name: string;
  admin: string;
  students: string[];
  instructors?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface IMessage extends Document {
  group: string;
  sender: string;
  role: "admin" | "student" | "instructor";
  text?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;

  // New fields (for classroom discussions)
  classroomId?: Types.ObjectId; // Link to classroom
  groupName?: string; // Discussion group name (e.g., "Group A")
  files?: Array<{
    url: string;
    name: string;
    type: "pdf" | "doc" | "video" | "image" | "audio" | "other";
  }>;
}

const groupSchema = new mongoose.Schema(
  {
    groupId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    admin: { type: String, required: true },
    students: [String],
    instructors: [String],
  },
  {
    timestamps: true,
  }
);

const messageSchema = new mongoose.Schema(
  {
    group: { type: String, required: true },
    classroomId: { type: Types.ObjectId, ref: "Classroom" },
    groupName: String,
    sender: { type: String, required: true },
    senderId: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "student", "instructor"],
      required: true,
    },
    text: String,
    image: String,
    files: [
      {
        url: String,
        name: String,
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Group = mongoose.model<IGroup>("Group", groupSchema);
const Message = mongoose.model<IMessage>("Message", messageSchema);

export { Group, Message, IGroup, IMessage };
