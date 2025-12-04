import express from "express";
const apiRouter = express.Router();

// import authRouter from...
//import

// example
// apiRouter.use("/auth", authRouter);

apiRouter.get("/get_IP", (req, res) => {
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

export default apiRouter;
