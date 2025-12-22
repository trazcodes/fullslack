import { generateStreamToken } from "../config/stream.js"

export const getStreamToken = (req, res) => {
    try {
        console.log("into getStreamToken");
        const token = generateStreamToken(req.auth().userId);
        
        res.status(200).json({ token });
    } catch (error) {
        console.log("Error generating Stream token:", error);
        res.status(500).json({
            message: "Failed to generate Stream token",
            details: error.message || "Unknown error"

        })
    }
}