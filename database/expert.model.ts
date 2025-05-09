import { Schema, models, model, type Document } from "mongoose";

// Knowledge Base Article Schema
export interface IKnowledgeBaseArticle extends Document {
  title: string;
  content: string;
  category: string;
  author: Schema.Types.ObjectId;
  views: number;
  likes: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  slug: string;
}

const KnowledgeBaseArticleSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  views: { type: Number, default: 0 },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
  slug: { type: String, required: true, unique: true },
});

// Code Challenge Schema
export interface ICodeChallenge extends Document {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  tags: string[];
  author: Schema.Types.ObjectId;
  starterCode: string;
  testCases: {
    input: string;
    expectedOutput: string;
  }[];
  submissions: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  slug: string;
}

const CodeChallengeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "expert"],
    required: true,
  },
  tags: [{ type: String }],
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  starterCode: { type: String, default: "// Your code here" },
  testCases: [
    {
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true },
    },
  ],
  submissions: [{ type: Schema.Types.ObjectId, ref: "CodeSubmission" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  published: { type: Boolean, default: false },
  slug: { type: String, required: true, unique: true },
});

// Code Submission Schema
export interface ICodeSubmission extends Document {
  challenge: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  code: string;
  passed: boolean;
  executionTime: number;
  createdAt: Date;
}

const CodeSubmissionSchema = new Schema({
  challenge: {
    type: Schema.Types.ObjectId,
    ref: "CodeChallenge",
    required: true,
  },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  code: { type: String, required: true },
  passed: { type: Boolean, required: true },
  executionTime: { type: Number }, // in milliseconds
  createdAt: { type: Date, default: Date.now },
});

// Event Attachment Schema (replacing ConsultingSession)
export interface IEvent extends Document {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  country: string;
  technologies: string[];
  website: string;
  organizer: string;
  submitter: Schema.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  isFeatured: boolean;
  isVirtual: boolean;
  eventType:
    | "conference"
    | "webinar"
    | "hackathon"
    | "meetup"
    | "workshop"
    | "other";
  comments: {
    user: Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  ratings: {
    user: Schema.Types.ObjectId;
    score: number;
    createdAt: Date;
  }[];
  bookmarks: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true },
  technologies: [{ type: String }],
  website: { type: String },
  organizer: { type: String, required: true },
  submitter: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  isFeatured: { type: Boolean, default: false },
  isVirtual: { type: Boolean, default: false },
  eventType: {
    type: String,
    enum: ["conference", "webinar", "hackathon", "meetup", "workshop", "other"],
    required: true,
  },
  comments: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  ratings: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      score: { type: Number, required: true, min: 1, max: 5 },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  bookmarks: [{ type: Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Expert Availability Schema
export interface IExpertAvailability extends Document {
  expert: Schema.Types.ObjectId;
  date: Date;
  timeSlots: string[];
  rate: number; // hourly rate in USD
  createdAt: Date;
  updatedAt: Date;
}

const ExpertAvailabilitySchema = new Schema({
  expert: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  timeSlots: [{ type: String }],
  rate: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Expert Profile Schema (extends User model)
export interface IExpertProfile extends Document {
  user: Schema.Types.ObjectId;
  expertise: string[];
  bio: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  consultingRate: number; // hourly rate in USD
  createdAt: Date;
  updatedAt: Date;
}

const ExpertProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  expertise: [{ type: String }],
  bio: { type: String },
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  consultingRate: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create or get models
const KnowledgeBaseArticle =
  models.KnowledgeBaseArticle ||
  model("KnowledgeBaseArticle", KnowledgeBaseArticleSchema);
const CodeChallenge =
  models.CodeChallenge || model("CodeChallenge", CodeChallengeSchema);
const CodeSubmission =
  models.CodeSubmission || model("CodeSubmission", CodeSubmissionSchema);
const Event = models.Event || model("Event", EventSchema);
const ExpertAvailability =
  models.ExpertAvailability ||
  model("ExpertAvailability", ExpertAvailabilitySchema);
const ExpertProfile =
  models.ExpertProfile || model("ExpertProfile", ExpertProfileSchema);

export {
  KnowledgeBaseArticle,
  CodeChallenge,
  CodeSubmission,
  Event,
  ExpertAvailability,
  ExpertProfile,
};
