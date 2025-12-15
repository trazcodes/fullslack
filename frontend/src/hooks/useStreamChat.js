import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";


const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export const useStreamChat = () => {
    const { user } = useUser();
    const [chatClient, setChatClient] = useState(null);

    // fetch steam token using react-query
    const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
        queryKey:["streamToken"],
        queryFn: getStreamToken,
        enable: !!user?.id,
    });
    //init stream chat client
    useEffect(()=>{
        const initChat = async ()=>{
            if(!tokenData?.token || !user) return;
            try {
                const client = StreamChat.getInstance(STREAM_API_KEY)
                await client.connectUser({
                    id: user.id,
                    name: user.fullName,
                    image: user.imageUrl
                })
                setChatClient(client)
            } catch (error) {
                console.log("Error connecting to stream",error);
                
            }
        };

        initChat();

        // cleanup
        return ()=>{
            if(chatClient) chatClient.disconnectUser();
        }
    },[tokenData, user, chatClient])

    return {chatClient, isLoading:tokenLoading, error: tokenError}
}
