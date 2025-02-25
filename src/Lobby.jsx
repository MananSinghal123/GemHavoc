import { insertCoin } from "playroomkit";
import React, { useEffect, useState } from "react";
import { GameEngineProvider } from "./hooks/useGameEngine";
import "./index.css";
import Game from "./Game";

function Lobby() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    insertCoin({
      //   streamMode: true,
    }).then(() => {
      setIsReady(true); // Set the state to indicate the game is ready
    });
  }, []);

  // Render the Game component only when the game is ready
  return isReady ? (
    <GameEngineProvider>
      <Game />
    </GameEngineProvider>
  ) : (
    <div>Loading...</div> // Show a loading state while waiting
  );
}

export default Lobby;
