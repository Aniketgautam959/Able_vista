import mongoose, { Document, Schema, Types } from "mongoose";

interface IAttachment {
  name: string;
  url: string;
  type: string;
  description?: string;
}

export interface ILesson extends Document {
  title: string;
  description?: string;
  chapter: Types.ObjectId;
  course: Types.ObjectId;
  order: number;
  type: "video" | "reading" | "project";
  duration: string;
  durationMinutes: number;
  videoUrl?: string;
  textContent?: string;
  extracted_text?: string; // Added field
  attachments: IAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  description: {
    type: String,
    maxlength: 1000,
  },
  chapter: {
    type: Schema.Types.ObjectId,
    ref: "Chapter",
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  order: {
    type: Number,
    required: true,
    min: 1,
  },
  type: {
    type: String,
    required: true,
    enum: ["video", "reading", "project"],
  },
  duration: {
    type: String,
    required: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
  },
  videoUrl: String,
  textContent: String,
  extracted_text: String, // Added field to schema
  attachments: [
    {
      name: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      description: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

lessonSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Lesson ||
  mongoose.model<ILesson>("Lesson", lessonSchema);
