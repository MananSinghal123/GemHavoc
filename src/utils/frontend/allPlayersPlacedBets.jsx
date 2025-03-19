import React from "react";
import { useMultiplayerState, usePlayersList } from "playroomkit";

// Convert to a React component instead of a regular function
export const AllPlayersPlacedBetsCheck = () => {
  const allPlayersList = usePlayersList(true);
  const [playerBets] = useMultiplayerState("playerBets", {});
  
  // Calculate the result
  const allConfirmed = allPlayersList.length > 0 && 
    allPlayersList.every(player => 
      playerBets[player.id] && playerBets[player.id].confirmed
    );
    
  // Return the result for use in JSX
  return allConfirmed;
};

// If you need it as a function that can be called elsewhere, create a wrapper component
export const useAllPlayersPlacedBets = () => {
  const allPlayersList = usePlayersList(true);
  const [playerBets] = useMultiplayerState("playerBets", {});
  
  if (allPlayersList.length === 0) return false;
  
  return allPlayersList.every(player =>
    playerBets[player.id] && playerBets[player.id].confirmed
  );
};