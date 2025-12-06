import { StreamChat, TextComposer } from 'stream-chat';
import { ENV } from './env.js';


const streamClient = StreamChat.getInstance(ENV.STREAMING_API_KEY, ENV.STREAMING_API_SECRET);

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUser(userData);
        console.log("Stream user upserted successfully:0, userData.name");
        return userData
    } catch (error) {
        console.error("Error upserting Stream user:", error);
    }
}

export const deleteStreamUser = async (userId) => {
    try {
        await streamClient.deleteUser(userId);
        console.log("Stream user deleted successfully:", userId);

    } catch (error) {
        console.log("Error deleting Stream user:", error);

    }
}

export const generateStreamToken = (userId) => {
    try {
        const userIdString = userId.toString();
        return streamClient.createToken(userIdString);
    } catch (error) {
        console.log("Error creating Stream token:", error);
        return null;
    }
}