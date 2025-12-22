import express from "express";
import { getStreamToken } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/token", (req,res,next)=>{
    console.log("into api/chat/token path");
    next();
}, protectRoute, getStreamToken)

export default router;
