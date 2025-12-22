import {axiosInstance} from "../lib/axios.js";

export async function getStreamToken(){
    console.log("into frontend stream token");
    
    const response = await axiosInstance.get("/chat/token");
    return response.data;
}