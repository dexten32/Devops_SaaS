import express from "express";
import projectRoutes from "./routes/projectRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

app.use("/projects", projectRoutes);

app.get("/health", (req, res) => {
  res.send("OK");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
