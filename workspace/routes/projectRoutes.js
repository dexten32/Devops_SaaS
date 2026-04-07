import express from "express";
import {
  getAllProjects,
  createProject,
  deployProject,
} from "../controllers/projectController.js";
const router = express.Router();

router.get("/", getAllProjects);
router.post("/", createProject);
router.post("/:id/deploy", deployProject);

export default router;
