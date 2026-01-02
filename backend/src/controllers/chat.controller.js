import { generateStreamToken } from "../config/stream.js"

export const getStreamToken = (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const token = generateStreamToken(userId);
    return res.status(200).json({ token });
  } catch (error) {
    console.error("Error generating Stream token:", error);
    return res.status(500).json({ message: error.message });
  }
};
