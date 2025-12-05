import "dotenv/config";
import cookieParser from "cookie-parser";
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import apiRouter from "./routes/api.js";
import Database from "better-sqlite3";
import fetch from "node-fetch";

const app = express();
const PORT = 3001;
const FLASK_URL = "http://129.151.255.248:3002/api/chatbot";
const db = new Database("database.db");

// Exemple table
db.exec(`
  CREATE TABLE IF NOT EXISTS snake_verified (
    ip VARCHAR(50)
  );
`);

const frontBuildPath = path.join(process.cwd(), "../.."); //A CHANGER

// Middlewares
// app.use(
// 	cors({
// 		origin: "http://127.0.0.1:5500", //A CHANGER
// 		methods: ["GET", "POST", "PUT", "DELETE"],
// 		credentials: true,
// 	})
// );
app.use(cors());

function getIP(req: Request, res: Response): string | undefined {
	let ip = req.ip;
	if (!ip) {
		res.status(404).send("Invalid IP.");
		return;
	}

	// Si IPv6 format ::ffff:IPv4
	if (ip.startsWith("::ffff:")) {
		ip = ip.split(":").pop();
	}
	return ip;
}
app.use(express.static(frontBuildPath));
app.use(express.json());
app.use(cookieParser());

app.get("/api/get_IP", (req, res) => {
	const ip = getIP(req, res);
	res.json({ IP: ip });
});

app.get("/api/snake_password", (req, res) => {
	const ip = getIP(req, res);

	const stmt = db.prepare("SELECT * FROM snake_verified WHERE ip = ?");
	const row = stmt.get(ip);

	res.json({ hasRequiredLevel: row ? true : false });
});

app.post("/api/snake_password", (req, res) => {
	const ip = getIP(req, res);

	const stmt = db.prepare("INSERT INTO snake_verified (ip) VALUES (?)");
	stmt.run(ip);

	res.json({ success: true });
});

app.post("/api/chatbot", async (req, res) => {
	try {
		const response = await fetch(FLASK_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(req.body), // Forward le body reçu
		});

		const data = await response.json();
		res.json(data); // renvoie la réponse de Flask au front
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Erreur lors de la requête vers Flask" });
	}
});

// Redirect all non-API to index
app.get("/", (req, res) => {
	res.sendFile(path.join(frontBuildPath, "index.html"));
});

app.get("/*splat", (req, res) => {
	res.sendFile(path.join(frontBuildPath, "index.html"));
});

app.listen(PORT, () => {
	console.log(`Serveur lancé sur http://localhost:${PORT}`);
});

export default app;
