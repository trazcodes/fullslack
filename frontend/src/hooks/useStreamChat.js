import { useState, useEffect } from "react";
import { StreamChat } from "stream-chat";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";


const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export const useStreamChat = () => {
    const { user } = useUser();
    const [chatClient, setChatClient] = useState(null);
    // -----------------------------------------
    console.log(user, chatClient);
    
    // fetch steam token using react-query
    const { data: tokenData, isLoading, error } = useQuery({
        queryKey: ["streamToken", user?.id],
        queryFn: getStreamToken,
        enabled: !!user?.id,
    });
    //init stream chat client
    useEffect(() => {
        // =============================================
        console.log(tokenData?.token, user?.id, STREAM_API_KEY);
        
        if (!tokenData?.token || !user?.id || !STREAM_API_KEY) return;

        const client = StreamChat.getInstance(STREAM_API_KEY);
        let cancelled = false;


        const connect = async () => {
            try {
                await client.connectUser({
                    id: user.id,
                    name:
                        user.fullName ?? user.username ?? user.primaryEmailAddress?.emailAddress ?? user.id,
                    image: user.imageUrl ?? undefined,
                },
                    tokenData.token
                );
                if (!cancelled) {
                    setChatClient(client);
                    console.log(client);
                    
                }
            } catch (error) {
                console.log("Error connecting to stream", error);

            }
        };

        connect();

        // cleanup
        return () => {
            cancelled = true;
            client.disconnectUser();
        };
    }, [tokenData?.token, user?.id])

    return { chatClient, isLoading, error }
};
