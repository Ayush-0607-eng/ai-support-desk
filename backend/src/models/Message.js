import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    sender: { type: String, enum: ["customer", "agent", "ai"], required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    content: { type: String, required: true },
    isDraft: { type: Boolean, default: false },
    sources: [{ title: String, snippet: String, docId: String, score: Number }]
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
