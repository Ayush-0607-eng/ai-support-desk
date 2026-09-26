import express from "express";
import multer from "multer";
import { createKnowledgeDoc, getKnowledgeDocs, deleteKnowledgeDoc, uploadKnowledgeDoc } from "../controllers/knowledgeController.js";
import { protect } from "../middleware/auth.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = express.Router();

router.use(protect);
router.route("/").get(getKnowledgeDocs).post(createKnowledgeDoc);
router.post("/upload", upload.single("file"), uploadKnowledgeDoc);
router.delete("/:id", deleteKnowledgeDoc);

export default router;
