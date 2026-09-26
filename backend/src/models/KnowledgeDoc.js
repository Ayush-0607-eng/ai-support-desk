import mongoose from "mongoose";

const knowledgeDocSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    sourceType: { type: String, enum: ["manual", "upload"], default: "manual" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    chunkCount: { type: Number, default: 0 },
    status: { type: String, enum: ["processing", "indexed", "failed"], default: "processing" }
  },
  { timestamps: true }
);

export default mongoose.model("KnowledgeDoc", knowledgeDocSchema);
