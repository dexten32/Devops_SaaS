import crypto from "crypto";
import path from "path";
import { spawn } from "child_process";

let projects = [];

export const getAllProjects = (req, res) => {
  res.json(projects);
};

export const createProject = (req, res) => {
  const { name, path, port, env, repoURL } = req.body;
  if (!name || !path || !port) {
    const error = new Error("Name, Path, and Port are required");
    error.statusCode = 400;
    throw error;
  }
  const newProject = {
    id: crypto.randomUUID(),
    name,
    repoURL,
    port,
    path,
    env: env || {},
    status: "idle",
    lastDeployed: null,
  };
  projects.push(newProject);
  res.status(200).json(newProject);
};

export const deployProject = (req, res) => {
  const { id } = req.params;
  const project = projects.find((p) => p.id === id);
  if (!project) {
    const error = new Error("Project not found.");
    error.statusCode = 404;
    throw error;
  }
  project.status = "deploying";
  res.json({
    message: `Deployment started for project ${project.name}.`,
    project,
  });

  const scriptPath = path.join(process.cwd(), "..", "deploy.sh");

  console.log(`[DEBUG] Attempting to run: bash ${scriptPath}`);

  const envVars = Object.entries(project.env || {})
    .map(([key, value]) => `-e ${key}=${value}`)
    .join(" ");

  const child = spawn("bash", [
    scriptPath,
    project.name,
    project.port,
    project.path,
    envVars
  ]);

  child.stdout.on("data", (data) => {
    console.log(`[STDOUT - ${project.name}]: ${data}`);
  });
  child.stderr.on("data", (data) => {
    console.error(`[STDERR - ${project.name}]: ${data}`);
  });

  child.on("close", (code) => {
    if (code === 0) {
      project.status = "success";
      project.lastDeployed = new Date().toISOString();
      console.log(
        `>>> Success ${project.name} is live on port ${project.port}`,
      );
    } else {
      project.status = "failed";
      console.error(
        `>>> ERROR: ${project.name} deployment failed with code ${code}`,
      );
    }
  });
};

export const getProjects = (req, res) => res.json(projects);
