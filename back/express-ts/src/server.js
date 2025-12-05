import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import path from "path";
const app = express();
const PORT = 3001;
const frontBuildPath = path.join(process.cwd(), "../.."); //A CHANGER
// Middlewares
app.use(cors({
    origin: "http://127.0.0.1:5500", //A CHANGER
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express.static(frontBuildPath));
app.use(express.json());
app.use(cookieParser());
app.get("/api/get_IP", (req, res) => {
    let ip = req.ip;
    if (!ip) {
        res.status(404).send("Invalid IP.");
        return;
    }
    // Si IPv6 format ::ffff:IPv4
    if (ip.startsWith("::ffff:")) {
        ip = ip.split(":").pop();
    }
    res.send(`Votre IP IPv4 est : ${ip}`);
});
app.get("/api/snake_password", (req, res) => {
    //a implémenter le check en BD
    res.json({ hasRequiredLevel: true });
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