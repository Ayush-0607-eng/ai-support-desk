import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    status: { type: String, enum: ["open", "pending", "resolved", "closed"], default: "open" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    category: { type: String, default: "general" },
    assignedAgents: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

ticketSchema.index({ subject: "text", description: "text", customerName: "text" });

export default mongoose.model("Ticket", ticketSchema);
