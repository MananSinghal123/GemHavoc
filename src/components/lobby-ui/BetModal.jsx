// BetModal.jsx
import { useState } from "react";
import { Input } from "../ui/input";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { myPlayer } from "playroomkit";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { placeBet } from "../../entry-functions/place_bet";
import { aptosClient } from "../../utils/aptosClient";

export const BetModal = ({ 
  setShowBetModal, 
  playerBets, 
  setPlayerBets,
  data,
  error,
  setError
}) => {
  const [bet, setBet] = useState(0);
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient();
  const me = myPlayer();
  const { asset, yourBalance } = data ?? {};

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

    const response = await signAndSubmitTransaction(
      placeBet({
        assetType: asset.asset_type,
        amount,
        decimals: asset.decimals,
      }),
    );
    
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
  };

  return (
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
  );
};