import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "./ui/button";
import { APT, aptos } from "../utils/aptos";

const Buy = ({ listing }) => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    if (!account) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${process.env.VITE_MODULE_ADDRESS}::launchpad::purchase`,
          typeArguments: [APT],
          functionArguments: [listing.listing_object_address],
        },
      });
      await aptos
        .waitForTransaction({
          transactionHash: response.hash,
        })
        .then(() => {
          alert("Ye successfully plundered this treasure!");
        });
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-[#3d2b1f] rounded-lg border-2 border-amber-900/70 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[url('/wood-texture.jpg')] opacity-20"></div>

      {/* Price display styled as a treasure chest */}
      <div className="flex items-center gap-2 bg-[#2a1810] px-4 py-2 rounded-md border border-amber-600 relative z-10">
        <span className="text-amber-400">💰 Bounty:</span>
        <span className="text-amber-300 font-bold">{listing.price} APT</span>
      </div>

      {/* Buy button styled as a pirate banner */}
      <Button
        onClick={onSubmit}
        disabled={isLoading || !account}
        className="w-full bg-amber-700 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-md transition-colors border-2 border-amber-900 shadow-lg relative z-10 group transform hover:scale-105"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>All hands on deck...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">⚓</span>
            <span>Claim This Booty!</span>
          </div>
        )}
      </Button>

      {/* Explorer link styled as an old map reference */}
      <a
        href={`https://explorer.aptoslabs.com/account/${listing.seller_address}?network=testnet`}
        rel="noopener noreferrer"
        target="_blank"
        className="text-sm text-amber-400 hover:text-amber-300 transition-colors hover:underline flex items-center gap-1 relative z-10"
      >
        <span>🧭</span>
        <span>View trader in the captain's log</span>
      </a>

      {/* Connection message */}
      {!account && (
        <p className="text-sm text-amber-400/70 italic relative z-10">
          Ye need to connect yer wallet to trade, matey!
        </p>
      )}
    </div>
  );
};

export default Buy;
