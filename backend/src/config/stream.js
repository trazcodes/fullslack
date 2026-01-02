import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";

const streamClient = StreamChat.getInstance(
  ENV.STREAM_API_KEY,
  ENV.STREAM_API_SECRET
);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUser(userData);
    console.log("Stream user upserted successfully:", userData.name);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
    throw error;
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await streamClient.deleteUser(userId);
    console.log("Stream user deleted successfully:", userId);
  } catch (error) {
    console.error("Error deleting Stream user:", error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  if (!userId) {
    throw new Error("UserId is required to generate Stream token");
  }

  return streamClient.createToken(userId.toString());
};

export const addUserToPublicChannels = async (newUserId) => {
  const publicChannels = await streamClient.queryChannels(
    { discoverable: true },
    {},
    { watch: false }
  );

  for (const channel of publicChannels) {
    await channel.addMembers([newUserId]);
  }
};
