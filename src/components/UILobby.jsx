import {
  isHost,
  myPlayer,
  useMultiplayerState,
  usePlayersList,
} from "playroomkit";
import { useContext, useEffect, useState } from "react";
import { ChatWindow } from "./ChatWindow";
import { Button } from "./ui/button";
import { AppContext } from "../App";
import MarketplaceView from "./MarketplaceView";
import { WalletSelector } from "./WalletSelector";
import { Input } from "./ui/input";
import { useGameEngine } from "../hooks/useGameEngine";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useGetAssetData } from "../hooks/useGetAssetData";
import { placeBet } from "../entry-functions/place_bet";
import { aptosClient } from "../utils/aptosClient";
import { useQueryClient } from "@tanstack/react-query";

export const UILobby = () => {
  const me = myPlayer();
  const [gameScene, setGameScene] = useMultiplayerState("gameScene", "lobby");
  const [loadingSlide, setLoadingSlide] = useState(true);
  const { data } = useGetAssetData();
    const [error, setError] = useState(null)
    const { asset, userMintBalance, yourBalance, maxSupply, currentSupply } = data ?? {};
  const [nameInput, setNameInput] = useState(
    me?.getState("name") || me?.state.profile?.name
  );  

   const {  
      players,
    } = useGameEngine();

  const [invited, setInvited] = useState(false);
  const { market, setMarket } = useContext(AppContext);
  const [playerBets, setPlayerBets] = useMultiplayerState("playerBets", {});
  const [bet,setBet]=useState(0);
 const { account,signAndSubmitTransaction } = useWallet();
 const [showBetModal, setShowBetModal] = useState(false);
 const queryClient = useQueryClient();

  const invite = () => {
    navigator.clipboard.writeText(window.location.href);
    setInvited(true);
    setTimeout(() => setInvited(false), 2000);
  };

  useEffect(() => {
    console.log(gameScene)
    setLoadingSlide(true);
    if (gameScene !== "loading") {
      const timeout = setTimeout(() => {
        setLoadingSlide(false);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [gameScene]);

  usePlayersList(true);

  // Animation states for pirate-themed loading
  const [wavePosition, setWavePosition] = useState(0);
  const [shipPosition, setShipPosition] = useState(-20);
  const [islandVisible, setIslandVisible] = useState(false);
  const [loadingText, setLoadingText] = useState("Sailing the high seas");
  
  // Animation effect for pirate loading screen
  useEffect(() => {
    if (loadingSlide) {
      // Wave animation
      const waveInterval = setInterval(() => {
        setWavePosition(prev => (prev + 1) % 20);
      }, 120);
      
      // Ship animation - gradually move across screen
      const shipInterval = setInterval(() => {
        setShipPosition(prev => {
          if (prev >= 85) {
            // When ship reaches end, show island
            setIslandVisible(true);
            setLoadingText("Land ho! Island spotted!");
            return prev;
          }
          return prev + 2;
        });
      }, 100);
      
      // Loading text animation
      const textInterval = setInterval(() => {
        if (!islandVisible) {
          setLoadingText(prev => {
            if (prev.endsWith("...")) return "Sailing the high seas";
            return prev + ".";
          });
        }
      }, 500);
      
      return () => {
        clearInterval(waveInterval);
        clearInterval(shipInterval);
        clearInterval(textInterval);
      };
    }
  }, [loadingSlide, islandVisible]);


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
    const updatedBets = {...playerBets};
    updatedBets[me.id] = {
      amount: amount,
      confirmed: true,
      timestamp: Date.now()
    };
    setPlayerBets(updatedBets);
    setTimeout(() => setShowBetModal(false), 2000);


    // setAssetCount("1");
  };

  const allPlayersList = usePlayersList(true);

  const allPlayersPlacedBets = () => {
  if (allPlayersList.length === 0) return false;
  
  return allPlayersList.every(player => 
    playerBets[player.id] && playerBets[player.id].confirmed
  );
};

  if(market) return <MarketplaceView />;

   

  return (
    <>
      {/* Pirate-themed loading screen */}
      <div
        className={`fixed z-30 top-0 left-0 right-0 h-screen bg-gradient-to-b from-sky-400 to-blue-600 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-1000
        ${loadingSlide ? "opacity-100" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Sky and clouds */}
        <div className="absolute top-0 left-0 w-full h-1/3 overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white bg-opacity-80"
              style={{
                width: `${Math.random() * 100 + 50}px`,
                height: `${Math.random() * 40 + 20}px`,
                left: `${(i * 20) + (Math.random() * 10)}%`,
                top: `${Math.random() * 100}px`,
              }}
            />
          ))}
        </div>

        {/* Island (appears later) */}
        <div
          className={`absolute transition-opacity duration-1000 ${islandVisible ? 'opacity-100' : 'opacity-0'}`}
          style={{ right: '15%', bottom: '20%' }}
        >
          <div className="w-48 h-32 bg-yellow-700 rounded-t-full relative">
            <div className="absolute top-0 left-1/4 w-8 h-16 bg-green-800 rounded-full"></div>
            <div className="absolute top-0 left-1/2 w-10 h-20 bg-green-700 rounded-full"></div>
            <div className="absolute top-0 right-1/4 w-8 h-16 bg-green-800 rounded-full"></div>
          </div>
        </div>

        {/* Ship */}
        <div
          className="absolute transition-transform duration-300 ease-in-out"
          style={{ 
            bottom: '30%', 
            left: `${shipPosition}%`,
            transform: `rotate(${Math.sin(Date.now() / 1000) * 5}deg)`,
          }}
        >
          <div className="relative">
            {/* Ship hull */}
            <div className="w-24 h-12 bg-amber-800 rounded-b-full"></div>
            
            {/* Ship mast */}
            <div className="absolute bottom-8 left-1/2 w-2 h-20 bg-amber-900 -translate-x-1/2"></div>
            
            {/* Ship sail */}
            <div className="absolute bottom-12 left-1/2 w-16 h-14 bg-white -translate-x-1/2 -translate-x-1"
                style={{ clipPath: 'polygon(0 0, 100% 0, 75% 100%, 25% 100%)' }}>
              <div className="w-full h-0.5 bg-amber-700 mt-2"></div>
              <div className="w-full h-0.5 bg-amber-700 mt-2"></div>
              <div className="w-6 h-6 absolute top-1 left-1/2 -translate-x-1/2 text-black text-xl">☠️</div>
            </div>
          </div>
        </div>

        {/* Ocean waves */}
        <div className="absolute bottom-0 left-0 w-full h-1/4 bg-blue-700">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className="absolute bg-blue-500 rounded-full"
              style={{
                width: '120px',
                height: '40px',
                left: `${((i * 10) + wavePosition) % 100}%`,
                bottom: `${Math.random() * 20 + 60}%`,
                opacity: 0.7,
              }}
            />
          ))}
        </div>

        {/* Loading text */}
        <div className="absolute bottom-10 font-bold text-3xl text-white font-serif drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
          {loadingText}
        </div>
      </div>

      <div
        className={
          "fixed z-10 bottom-4 left-1/2 flex flex-wrap justify-center items-center gap-2.5 -translate-x-1/2 w-full max-w-[75vw]"
        }
      >
      </div>
      
      <div className="fixed bottom-4 left-4 z-10 flex flex-col gap-2 items-end">
      {!showBetModal && (
  <Button
    className="w-full font-semibold py-3 px-6 rounded-md transition-colors bg-amber-700 hover:bg-amber-600 text-white"
    onClick={() => setShowBetModal(true)}
  >
    Bet Now
  </Button>
)}
        {gameScene === "lobby" && isHost() && (
       <Button
       className={`w-full font-semibold py-3 px-6 rounded-md transition-colors ${
         isHost() && allPlayersPlacedBets()
           ? "bg-amber-700 hover:bg-amber-600 text-white"
           : "bg-gray-500 text-gray-300 cursor-not-allowed"
       }`}
       onClick={async () => {
         if (allPlayersPlacedBets()) {
           setGameScene("loading");
           setGameScene("game");
         } else {
           setError("All players must place their bets before starting the game");
         }
       }}
       disabled={!isHost() || !allPlayersPlacedBets()}
     >
       {isHost() ? 
         (allPlayersPlacedBets() ? "Start Game" : "Waiting for all bets...") 
         : "Waiting for host to start"}
     </Button>
          )}
        <WalletSelector/>
      </div>
 
      <Button
        className="z-10 fixed top-4 right-4 bg-amber-700 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-md transition-colors border-2 border-amber-900 shadow-lg flex items-center gap-2"
        onClick={invite}
        disabled={invited}
      >
        {invited ? (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
              />
            </svg>
            Link copied to clipboard
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
              />
            </svg>
            Invite
          </>
        )}
      </Button>


      {showBetModal && (
 <div className="fixed z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 bg-opacity-90 p-6 rounded-lg shadow-lg border-2 border-amber-700 max-w-md w-full pointer-events-auto">
 <h2 className="text-2xl font-bold text-amber-500 mb-4 text-center">Place Your Bet</h2>
 
 {/* Display wallet balance */}
 <div className="flex items-center justify-center mb-4 gap-2">
   {asset?.icon_uri && (
     <img
       src={asset.icon_uri}
       className="h-6 w-6 text-amber-400 rounded-full"
       alt={asset.symbol}
     />
   )}
   <span className="font-bold text-amber-400">Your Balance: {yourBalance} {asset?.symbol}</span>
 </div>
 
 {/* Error display */}
 {error && (
   <div className={`p-2 mb-4 rounded text-center ${error.includes("successfully") ? "bg-green-800 text-green-200" : "bg-red-800 text-red-200"}`}>
     {error}
   </div>
 )}


{playerBets[me.id] && playerBets[me.id].confirmed ? (
 <div className="text-center text-green-400 p-4 bg-green-900 bg-opacity-30 rounded-md">
   Your bet of {playerBets[me.id].amount} {asset?.symbol} has been placed!
 </div>
) : (
 <form onSubmit={placeBetFunc} className="space-y-4">
   <div className="flex flex-col">
     <label htmlFor="bet-amount" className="text-white mb-1">Bet Amount:</label>
     <Input
       id="bet-amount"
       type="text"
       value={bet}
       onChange={(e) => setBet(e.target.value)}
       className="bg-slate-700 text-white border-amber-600"
       placeholder="Enter amount"
       disabled={!account}
     />
   </div>
   
   <Button
     type="submit"
     className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-md transition-colors"
     disabled={!account}
   >
     Place Bet
   </Button>
   
   {!account && (
     <p className="text-amber-400 text-center">Connect your wallet to place a bet</p>
   )}
 </form>
)}
 
 
</div>
)}




{/* Player Bets Panel */}
<div className="fixed z-10 bottom-24 right-4 bg-slate-800 bg-opacity-90 p-4 rounded-lg shadow-lg border-2 border-amber-700 max-w-sm w-full">
  <h3 className="text-amber-500 font-bold text-xl mb-4 flex items-center">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
    </svg>
    Player Bets
  </h3>
  
  <div className="bg-slate-700 rounded-md overflow-hidden">
    {players.length === 0 ? (
      <div className="p-4 text-center">
        <div className="animate-pulse text-gray-400 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Waiting for players to join...
        </div>
      </div>
    ) : (
      <ul className="divide-y divide-slate-600">
        {players.map((player) => (
          <li key={player.id} className="p-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-amber-700 rounded-full flex items-center justify-center mr-3 text-white font-bold">
                {(player?.state?.profile?.name || `P${player.id}`).charAt(0).toUpperCase()}
              </div>
              <span className="text-white">{player?.state?.profile?.name || `Player ${player.id}`}</span>
            </div>
            {playerBets[player.id]?.confirmed ? (
              <div className="flex items-center bg-green-900 bg-opacity-50 py-1 px-3 rounded-full">
                <span className="text-green-400 font-medium text-sm mr-1">
                  {playerBets[player.id].amount} {asset?.symbol}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center bg-yellow-900 bg-opacity-30 py-1 px-3 rounded-full">
                <span className="text-yellow-400 text-sm">Waiting</span>
                <span className="ml-1 flex space-x-1">
                  <span className="animate-bounce delay-75 text-yellow-400">.</span>
                  <span className="animate-bounce delay-150 text-yellow-400">.</span>
                  <span className="animate-bounce delay-300 text-yellow-400">.</span>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    )}
  </div>
</div>



    </>
  );
};