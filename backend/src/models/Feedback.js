import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: String, enum: ["helpful", "not_helpful"], required: true },
    comment: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
