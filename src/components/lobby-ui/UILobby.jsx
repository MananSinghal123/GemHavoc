// Main UILobby component
import {
    isHost,
    myPlayer,
    useMultiplayerState,
    usePlayersList,
  } from "playroomkit";
import { useContext, useEffect, useState } from "react";

import { LoadingScreen } from "./LoadingScreen";
import { InviteButton } from "./InviteButton";
import { BetModal } from "./BetModal";
import { PlayerBetsPanel } from "./PlayerBetsPanel";
import { useGetAssetData } from "../../hooks/useGetAssetData";
import { useGameEngine } from "../../hooks/useGameEngine";
import { AppContext } from "../../App";
import { Button } from "../ui/button";
import { WalletSelector } from "../WalletSelector";
import MarketplaceView from "../market/MarketplaceView";
import {  useAllPlayersPlacedBets } from "../../utils/frontend/allPlayersPlacedBets";
  
  export const UILobby = () => {
    const me = myPlayer();
    const [gameScene, setGameScene] = useMultiplayerState("gameScene", "lobby");
    const [loadingSlide, setLoadingSlide] = useState(true);
    const { data } = useGetAssetData();
    const [error, setError] = useState(null);
    const { players } = useGameEngine();
    const [invited, setInvited] = useState(false);
    const { market, setMarket } = useContext(AppContext);
    const [playerBets, setPlayerBets] = useMultiplayerState("playerBets", {});
    const [showBetModal, setShowBetModal] = useState(false);
    const allPlayersPlacedBets=useAllPlayersPlacedBets();
  
    useEffect(() => {
      setLoadingSlide(true);
      if (gameScene !== "loading") {
        const timeout = setTimeout(() => {
          setLoadingSlide(false);
        }, 1000);
        return () => clearTimeout(timeout);
      }
    }, [gameScene]);
  
    // const allPlayersPlacedBets = () => {
    //   if (allPlayersList.length === 0) return false;
      
    //   return allPlayersList.every(player => 
    //     playerBets[player.id] && playerBets[player.id].confirmed
    //   );
    // };
  
    const invite = () => {
      navigator.clipboard.writeText(window.location.href);
      setInvited(true);
      setTimeout(() => setInvited(false), 2000);
    };
  
    if (market) return <MarketplaceView/>;
  
    return (
      <>
        <LoadingScreen loadingSlide={loadingSlide} />
  
        <div className="fixed bottom-4 left-4 z-10 flex flex-col gap-2 items-end">
          
          {gameScene === "lobby" && isHost() && (
            <Button
              size="md"
              className={` ${
                isHost() && allPlayersPlacedBets
                  ? "bg-amber-700 hover:bg-amber-600 text-white"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
              onClick={async () => {
                if (allPlayersPlacedBets) {
                  setGameScene("loading");
                  setGameScene("game");
                } else {
                  setError("All players must place their bets before starting the game");
                }
              }}
              disabled={!isHost() || !allPlayersPlacedBets}
            >
              {isHost() ? 
                (allPlayersPlacedBets ? "Start Game" : "Waiting for all bets...") 
                : "Waiting for host to start"}
            </Button>
          )}
          {!showBetModal && (
         <Button onClick={()=>setShowBetModal(true)} variant="primary" size="md">
             Bet Now
         </Button>
          )}
          <WalletSelector />
        </div>
   
        <InviteButton invited={invited} onInvite={invite} />
  
        {showBetModal && (
          <BetModal 
            setShowBetModal={setShowBetModal} 
            playerBets={playerBets}
            setPlayerBets={setPlayerBets}
            data={data}
            setError={setError}
            error={error}
          />
        )}
  
        <PlayerBetsPanel 
          players={players} 
          playerBets={playerBets} 
          asset={data?.asset} 
        />
      </>
    );
  };