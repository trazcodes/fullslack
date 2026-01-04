import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export const useStreamChat = () => {
  const { user, isLoaded } = useUser();
  const [chatClient, setChatClient] = useState(null);

  // Fetch Stream token
  const {
    data: tokenData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["streamToken", user?.id],
    queryFn: getStreamToken,
    enabled: isLoaded && !!user?.id,
    retry: false,
  });

  useEffect(() => {
    if (
      !isLoaded ||
      !user?.id ||
      !tokenData?.token ||
      !STREAM_API_KEY ||
      chatClient
    ) {
      return;
    }

    const client = StreamChat.getInstance(STREAM_API_KEY);
    let isCancelled = false;

    const connectUser = async () => {
      try {
        await client.connectUser(
          {
            id: user.id,
            name:
              user.fullName ||
              user.username ||
              user.primaryEmailAddress?.emailAddress ||
              user.id,
            image: user.imageUrl,
          },
          tokenData.token
        );

        if (!isCancelled) {
          setChatClient(client);
        }
      } catch (err) {
        console.error("❌ Stream connect failed:", err);
      }
    };

    connectUser();

    return () => {
      isCancelled = true;

      if (client.userID) {
        client.disconnectUser();
      }
    };
  }, [isLoaded, user?.id, tokenData?.token]);

  return {
    chatClient,
    isLoading,
    error,
  };
};
