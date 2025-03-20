import { useEffect, useState } from "react";
import { NB_ROUNDS, useGameEngine } from "../../hooks/useGameEngine";
import { WalletSelector } from "../WalletSelector";
import { useGetAssetData } from "../../hooks/useGetAssetData";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import UserWinDisplay from "../../hooks/getWinCount";
import { isHost, myPlayer, useMultiplayerState } from "playroomkit";

const audios = {
  background: new Audio("/audios/Drunken Sailor - Cooper Cannell.mp3"),
  punch: new Audio("/audios/punch.mp3"),
  shield: new Audio("/audios/shield.mp3"),
  grab: new Audio("/audios/grab.mp3"),
  fail: new Audio("/audios/fail.mp3"),
  cards: new Audio("/audios/cards.mp3"),
};

export const UI = () => {
  const {
    phase,
    startGame,
    timer,
    playerTurn,
    players,
    round,
    getCard,
    actionSuccess,
  } = useGameEngine();

  const currentPlayer = players[playerTurn];
  const me = myPlayer();
  const currentCard = getCard();
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();
  const [gameScene, setGameScene] = useMultiplayerState("gameScene", "lobby");
  const [playerWallets, setPlayerWallets] = useMultiplayerState("playerWallets", {});

  const target =
    phase === "playerAction" &&
    currentCard === "punch" &&
    players[currentPlayer.getState("playerTarget")];
  const { data } = useGetAssetData();
  const [error, setError] = useState(null);
  const { asset, userMintBalance, yourBalance, maxSupply, currentSupply } = data ?? {};
  const [playerBets,setPlayerBets] = useMultiplayerState("playerBets", {});

  const pickWinnerFunc = async () => {
    setError(null);
    
    if (!asset) {
      return setError("Asset not found");
    }

    // Find winner player ID
    const winnerPlayer = players.find(player => player.getState("winner"));
    if (!winnerPlayer) {
      return setError("No winner found");
    }

    const winnerAddress = playerWallets[winnerPlayer.id];  
    console.log("Winner Address", winnerAddress);
    if (!winnerAddress) {
      return setError("Winner's wallet address not found");
    }
  
    try {
      const response = await fetch('http://localhost:3000/api/pick-winner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetType: asset.asset_type,
          winnerAddress: winnerAddress,
        })
      });
  
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to pick winner');
      }
      
      console.log('Transaction successful:', data);
      queryClient.invalidateQueries();
      
    } catch (error) {
      console.error(error);
      setError("Failed to pick winner: " + error.message);
    }
  };

  let label = "";
  switch (phase) {
    case "cards":
      label = "Choose yer card, matey!";
      break;
    case "playerChoice":
      label =
        currentPlayer.id === me.id
          ? "Pick a scallywag to wallop!"
          : `${currentPlayer?.state.profile?.name} be choosin' a target!`;
      break;
    case "playerAction":
      switch (currentCard) {
        case "punch":
          label = actionSuccess
            ? `${currentPlayer?.state.profile?.name} strikes ${target?.state.profile?.name}!`
            : `${currentPlayer?.state.profile?.name} missed ${target?.state.profile?.name}!`;
          break;
        case "grab":
          label = actionSuccess
            ? `${currentPlayer?.state.profile?.name} snatches some booty!`
            : `No treasure for ${currentPlayer?.state.profile?.name}!`;
          break;
        case "shield":
          label = `${currentPlayer?.state.profile?.name} raises a mighty shield!`;
          break;
        default:
          break;
      }
      break;
    case "end":
      label = "Voyage Complete!";
      break;
    default:
      break;
  }

  // AUDIO MANAGER
  const [audioEnabled, setAudioEnabled] = useState(true);
  const toggleAudio = () => {
    setAudioEnabled((prev) => !prev);
  };

  useEffect(() => {
    if (audioEnabled) {
      audios.background.play();
      audios.background.loop = true;
    } else {
      audios.background.pause();
    }
    return () => {
      audios.background.pause();
    };
  }, [audioEnabled]);

  useEffect(() => {
    if (!audioEnabled) {
      return;
    }
    let audioToPlay;
    if (phase === "playerAction") {
      if (actionSuccess) {
        audioToPlay = audios[getCard()];
      } else {
        audioToPlay = audios.fail;
      }
    }
    if (phase === "cards") {
      audioToPlay = audios.cards;
    }
    if (audioToPlay) {
      audioToPlay.currentTime = 0;
      audioToPlay.play();
    }
  }, [phase, actionSuccess, audioEnabled]);

  useEffect(() => {
    if (phase === "end") {
      pickWinnerFunc();
    }
  }, [phase]);

  // When the wallet connects, map the player ID to their wallet address
  useEffect(() => {
    if (account && me) {
      const wallets = {...playerWallets};
      wallets[me.id] = account.address.toStringLong();
      setPlayerWallets(wallets);
    }
  }, [account, me]);

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col pointer-events-none">
      {/* Compact Header */}
      <div className="bg-black bg-opacity-50 border-b-2 border-amber-600 py-1 px-2 flex items-center justify-between">
        {/* Round Counter with pirate ship icon */}
        <div className="flex items-center gap-1">
          <span className="text-amber-400 text-sm font-bold">
            Voyage {round}/{NB_ROUNDS}
          </span>
          <span className="text-amber-400 text-sm ml-1">
            ⏱️ {timer}
          </span>
        </div>

        {/* Audio Toggle */}
        <button 
          onClick={toggleAudio} 
          className="text-amber-400 hover:text-amber-200 pointer-events-auto"
        >
          {audioEnabled ? "🔊" : "🔇"}
        </button>
        
        {/* Currency Display */}
        <div className="flex items-center gap-1">
          {asset?.icon_uri && (
            <img
              src={asset.icon_uri}
              className="h-4 w-4 text-amber-400"
              alt={asset?.symbol}
            />
          )}
          <span className="text-amber-400 text-sm font-bold">
            {yourBalance} {asset?.symbol} • Bet: {playerBets[me.id]?.amount || 0}
          </span>
          <div className="ml-1 scale-90">
            <WalletSelector />
          </div>
        </div>
      </div>

      {/* Game Status Message - Floats at bottom */}
      <div className="mt-auto">
        <div className="bg-black bg-opacity-70 border-t-2 border-amber-600 p-2 text-center relative">
          {/* Pirate-themed decorative corners */}
          <div className="absolute top-0 left-0 text-amber-600 text-xs">☠</div>
          <div className="absolute top-0 right-0 text-amber-600 text-xs">☠</div>
          
          {/* Game message */}
          <h1 className="text-amber-400 text-sm font-bold">{label}</h1>
          
          {/* Winner display */}
          {phase === "end" && (
            <p className="text-amber-200 text-xs mt-1">
              Winner: {" "}
              {players
                .filter((player) => player.getState("winner"))
                .map((player) => player?.state?.profile?.name)
                .join(", ")}
              !
            </p>
          )}
          
          {/* Game Control Buttons */}
          {isHost() && phase === "end" && (
            <div className="flex gap-2 mt-1 justify-center">
              {/* <button
                onClick={startGame}
                className="bg-amber-700 hover:bg-amber-600 text-amber-200 text-xs font-bold py-1 px-2 rounded pointer-events-auto transition-colors border border-amber-500"
              >
                Set Sail Again
              </button> */}

              <button
                onClick={() =>{
                   setGameScene("lobby");
                   setPlayerBets({})
                }}
                className="bg-amber-700 hover:bg-amber-600 text-amber-200 text-xs font-bold py-1 px-2 rounded pointer-events-auto transition-colors border border-amber-500"
              >
                Return to Port
              </button>
            </div>
          )}
          
          {/* Player stats */}
          {account && (
            <div className="absolute left-2 bottom-10 scale-75 origin-bottom-right">
              <UserWinDisplay player_addr={account?.address.toStringLong()}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};