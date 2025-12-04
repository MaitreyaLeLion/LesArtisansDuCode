import https from "https";
import fs from "fs";
import path from "path";
import app from "./server.ts";

const sslServer = https.createServer(
    {
        key: fs.readFileSync(path.join(process.cwd(), "certificate/key.pem")),
        cert: fs.readFileSync(path.join(process.cwd(), "certificate/cert.pem")),
    },
    app
);

sslServer.listen(Number(process.env.SERVER_PORT), () => {
    console.log("SSL running on " + process.env.SERVER_PORT);
});
