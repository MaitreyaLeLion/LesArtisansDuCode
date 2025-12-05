import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import path from "path";
import Database from "better-sqlite3";
const app = express();
const PORT = 3001;
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
function getIP(req, res) {
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
//# sourceMappingURL=server.js.map