import asyncHandler from "express-async-handler";
import KnowledgeDoc from "../models/KnowledgeDoc.js";
import { ingestDocument, deleteDocument } from "../utils/aiClient.js";
import logger from "../config/logger.js";
import pdfParse from "pdf-parse";

export const createKnowledgeDoc = asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400);
    throw new Error("Title and content are required");
  }
  const doc = await KnowledgeDoc.create({ title, content, uploadedBy: req.user._id, sourceType: "manual", organization: req.user.organization });
  try {
    const result = await ingestDocument(title, content, doc._id.toString(), req.user.organization.toString());
    doc.chunkCount = result.chunk_count;
    doc.status = "indexed";
    await doc.save();
  } catch (error) {
    logger.error(`Ingestion failed for doc ${doc._id}: ${error.message}`);
    doc.status = "failed";
    await doc.save();
  }
  res.status(201).json(doc);
});

export const uploadKnowledgeDoc = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }
  const title = req.body.title || req.file.originalname;
  const parsed = await pdfParse(req.file.buffer);
  const content = parsed.text.trim();
  if (!content) {
    res.status(400);
    throw new Error("Could not extract any text from this PDF");
  }
  const doc = await KnowledgeDoc.create({ title, content, uploadedBy: req.user._id, sourceType: "upload", organization: req.user.organization });
  try {
    const result = await ingestDocument(title, content, doc._id.toString(), req.user.organization.toString());
    doc.chunkCount = result.chunk_count;
    doc.status = "indexed";
    await doc.save();
  } catch (error) {
    logger.error(`Ingestion failed for doc ${doc._id}: ${error.message}`);
    doc.status = "failed";
    await doc.save();
  }
  res.status(201).json(doc);
});

export const getKnowledgeDocs = asyncHandler(async (req, res) => {
  const docs = await KnowledgeDoc.find({ organization: req.user.organization }).populate("uploadedBy", "name").sort({ createdAt: -1 });
  res.json(docs);
});

export const deleteKnowledgeDoc = asyncHandler(async (req, res) => {
  const doc = await KnowledgeDoc.findOne({ _id: req.params.id, organization: req.user.organization });
  if (!doc) {
    res.status(404);
    throw new Error("Document not found");
  }
  try {
    await deleteDocument(doc._id.toString());
  } catch (error) {
    logger.error(`Vector deletion failed for doc ${doc._id}: ${error.message}`);
  }
  await doc.deleteOne();
  res.json({ message: "Document deleted" });
});
