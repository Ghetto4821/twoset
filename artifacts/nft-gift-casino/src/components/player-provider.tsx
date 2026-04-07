import React, { createContext, useContext, useEffect, useState } from "react";
import { useCreatePlayer, useGetPlayer } from "@workspace/api-client-react";

interface PlayerContextType {
  userId: string | null;
  isLoading: boolean;
}

const PlayerContext = createContext<PlayerContextType>({ userId: null, isLoading: true });

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  
  const createPlayer = useCreatePlayer();
  const { data: player, isLoading: isPlayerLoading } = useGetPlayer(userId || "", {
    query: {
      enabled: !!userId,
      queryKey: ["/api/game/player", userId] as const,
    }
  });

  useEffect(() => {
    // Try to get existing user from local storage or create one
    const storedUserId = localStorage.getItem("casino_userId");
    
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Auto-create user
      const defaultUserId = "user_" + Math.random().toString(36).substring(2, 9);
      createPlayer.mutate(
        { data: { userId: defaultUserId, username: "Player" } },
        {
          onSuccess: (data) => {
            setUserId(data.userId);
            localStorage.setItem("casino_userId", data.userId);
          },
        }
      );
    }
  }, []);

  const isLoading = !userId || (!!userId && isPlayerLoading && !player);

  return (
    <PlayerContext.Provider value={{ userId, isLoading }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayerContext() {
  return useContext(PlayerContext);
}
