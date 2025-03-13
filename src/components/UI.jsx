import { isHost, isStreamScreen, myPlayer, useMultiplayerState } from "playroomkit";
import { useEffect, useState } from "react";
import { NB_ROUNDS, useGameEngine } from "../hooks/useGameEngine";
import { WalletSelector } from "./WalletSelector";
import { useGetAssetData } from "../hooks/useGetAssetData";
import { placeBet } from "../entry-functions/place_bet";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { aptosClient } from "../utils/aptosClient";
import { useQueryClient } from "@tanstack/react-query";
import { pickWinner } from "../entry-functions/pick_winner";
import UserWinDisplay, { getWinCount } from "../hooks/getWinCount";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS_TOKEN } from "../constants";

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
 const { account,signAndSubmitTransaction } = useWallet();
 const queryClient = useQueryClient();
  const [gameScene,setGameScene]=useMultiplayerState("gameScene","lobby")

  const target =
    phase === "playerAction" &&
    currentCard === "punch" &&
    players[currentPlayer.getState("playerTarget")];
     const { data } = useGetAssetData();
    const [error, setError] = useState(null)
    const { asset, userMintBalance, yourBalance, maxSupply, currentSupply } = data ?? {};
    const [bet,setBet]=useState(0);


    const placeBetFunc = async (e) => {
      e.preventDefault();
      setError(null);
  
      if (!account) {
        return setError("Please connect your wallet");
      }
  
      if (!asset) {
        return setError("Asset not found");
      }
  
      if (!data?.isMintActive) {
        return setError("Minting is not available");
      }
  
      const amount = parseFloat(bet);
      if (Number.isNaN(amount) || amount <= 0) {
        return setError("Invalid amount");
      }
  

      console.log(asset.asset_type,amount,asset.decimals)

      const response = await signAndSubmitTransaction(
        placeBet({
          assetType: asset.asset_type,
          amount,
          decimals: asset.decimals,
        }),
      );
      console.log(response)
      await aptosClient().waitForTransaction({ transactionHash: response.hash });
      queryClient.invalidateQueries();
      // setAssetCount("1");
    };
  
    const pickWinnerFunc = async () => {
      setError(null);
    
      if (!asset) {
        return setError("Asset not found");
      }
    
      try {
        // Call your backend API
        const response = await fetch('http://localhost:3000/api/pick-winner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assetType: asset.asset_type
          })
        });
    
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to pick winner');
        }
        
        console.log('Transaction successful:', data);
        
        // Update your UI as needed
        queryClient.invalidateQueries();
        
      } catch (error) {
        console.error(error);
        setError("Failed to pick winner: " + error.message);
      }
    };

  let label = "";
  switch (phase) {
    case "cards":
      label = "Select the card you want to play";
      break;
    case "playerChoice":
      label =
        currentPlayer.id === me.id
          ? "Select the player you want to punch"
          : `${currentPlayer?.state.profile?.name} is going to punch someone`;
      break;
    case "playerAction":
      switch (currentCard) {
        case "punch":
          label = actionSuccess
            ? `${currentPlayer?.state.profile?.name} is punching ${target?.state.profile?.name}`
            : `${currentPlayer?.state.profile?.name} failed punching ${target?.state.profile?.name}`;
          break;
        case "grab":
          label = actionSuccess
            ? `${currentPlayer?.state.profile?.name} is grabbing a gem`
            : `No more gems for ${currentPlayer?.state.profile?.name}`;
          break;
        case "shield":
          label = `${currentPlayer?.state.profile?.name} can't be punched until next turn`;
          break;
        default:
          break;
      }
      break;
    case "end":
      label = "Game Over";
      
      break;
    default:
      break;
  }

  // AUDIO MANAGER
  const [audioEnabled, setAudioEnabled] = useState(true);
  const toggleAudio = () => {
    setAudioEnabled((prev) => !prev);
  };

  // let navigate = useNavigate();

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


  useEffect(()=>{
  if(phase=="end"){
  pickWinnerFunc(  )
   }
  },[phase])

  return (
    <div className="text-white drop-shadow-xl fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col pointer-events-none">
      {/* Header Section */}
      <div className="p-4 w-full flex items-center justify-between">
        {/* Round Counter */}
        <h2 className="text-2xl font-bold text-center uppercase">
          Round {round}/{NB_ROUNDS}
        </h2>
        {account && <UserWinDisplay player_addr={account?.address.toStringLong()}/>}

        {/* Asset Display */}
        <div className="flex items-center gap-4">
          {/* Currency Display */}
          <div className="flex items-center gap-2">
            {asset?.icon_uri && (
              <img
                src={asset.icon_uri}
                className="h-6 w-6 text-amber-400 rounded-full"
                alt={asset.symbol}
              />
            )}
            <span className="font-bold text-amber-400">{yourBalance} {asset?.symbol}</span>
          </div>
  <form onSubmit={placeBetFunc} className="flex gap-3 ">
                      <Input
                        type="text"
                        name="amount"
                        value={bet}
                        onChange={(e) => {
                          setBet(e.target.value);
                        }}
                        className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded pointer-events-auto transition-colors"
                        />
                      <Button
                        type="submit"
                        className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded pointer-events-auto transition-colors"
                        >
                        PlaceBet
                      </Button>
                    </form>


             

          <WalletSelector />




        </div>

        {/* Timer */}
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-center uppercase">{timer}</h2>
        </div>
      </div>

      {/* Middle Spacer */}
      <div className="flex-1" />
      
      {/* Footer Section */}
      <div className="p-4 w-full">
        {/* Game Status Message */}
        <h1 className="text-2xl font-bold text-center mb-2">{label}</h1>
        
        {phase === "end" && (
          <p className="text-center mb-4">
            Winner:{" "}
            {players
              .filter((player) => player.getState("winner"))
              .map((player) => player.state.profile.name)
              .join(", ")}
            !
          </p>
        )}


        {/* {phase === "end" && isHost() && pickWinnerFunc()} */}


        {/* Game Control Buttons */}
        {isHost() && phase === "end" && (
          <div className="flex gap-4">
            <button
              onClick={startGame}
              className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded pointer-events-auto transition-colors"
            >
              Play again
            </button>

            <button
              onClick={() => setGameScene("lobby")}
              className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded pointer-events-auto transition-colors"
            >
              Exit
            </button>
          </div>
          
        )}
      </div>
    </div>
  );
};