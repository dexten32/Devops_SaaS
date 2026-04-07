import crypto from "crypto";

let projects = [];

export const getAllProjects = (req, res) => {
  res.json(projects);
};

export const createProject = (req, res) => {
  const { name, repoURL } = req.body;
  if (!name || !repoURL) {
    const error = new Error("Name and repoURL are required.");
    error.statusCode = 400;
    throw error;
  }
  const newProject = {
    id: crypto.randomUUID(),
    name,
    repoURL,
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
  project.lastDeployed = new Date().toISOString();

  setTimeout(() => {
    project.status = "Success";
    project.lastDeployed = new Date().toISOString();
    console.log(`log ${project.name} deployed`);
  }, 5000);
};
