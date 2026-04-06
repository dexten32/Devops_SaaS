import express from "express";
import {
  getAllProjects,
  createProject,
  deployProject,
} from "../controllers/projectController";
const router = express.Router();

router.get("/", getAllProjects);
router.post("/", createProject);
router.get("/:id/deploy", deployProject);


export default router;