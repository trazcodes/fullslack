import express from 'express';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { clerkMiddleware } from '@clerk/express'
import { functions, inngest } from './config/inngest.js';
import { serve } from "inngest/express";
import chatRoutes from "./routes/chat.route.js";
import cors from 'cors'

const app = express();

app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173",
        "http://13.205.127.170",
        "https://fullslack.duckdns.org"
    ],
    credentials: true,
}));
app.use(clerkMiddleware());


app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", (req, res, next) => {
    console.log("api called");
    next();
}, chatRoutes);


app.get('/', (req, res) => {
    res.send("Hello from Express server! CICD Implemented");
})

const startServer = async () => {
    try {
        connectDB();
        app.listen(ENV.PORT, () => {
            console.log("Server is running on port:", ENV.PORT);
        });

    } catch (error) {
        console.log("Error starting server", error);
        process.exit(1);
    }
}

startServer();

export default app;