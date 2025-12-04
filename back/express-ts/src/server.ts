import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import path from "path";
import apiRouter from "./routes/api";

const app = express();

const frontBuildPath = path.join(process.cwd(), "../front/WINUX..."); //A CHANGER

// Middlewares
app.use(
	cors({
		origin: "http://localhost:5173", //A CHANGER
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	})
);

app.use(express.static(frontBuildPath));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api", apiRouter);

// Redirect all non-API to index
app.get("/", (req, res) => {
	res.sendFile(path.join(frontBuildPath, "index.html"));
});

app.get("/*splat", (req, res) => {
	res.sendFile(path.join(frontBuildPath, "index.html"));
});

export default app;
