import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Network, NetworkToChainId } from "@aptos-labs/ts-sdk";
import { Alert, AlertTitle } from "./ui/alert";
import { useGetNftsByOwner } from "../hooks/useGetNftsByOwner";
import { useGetAllListedNfts } from "../hooks/useGetAllListedNfts";
import NftCard from "./NftCard";
import Buy from "./Buy";
import List from "./List";
import { WalletSelector } from "./WalletSelector";

const MarketplaceView = () => {
  const [activeTab, setActiveTab] = useState("nft");
  const navigate = useNavigate();
  const { connected, network, account } = useWallet();
  const [nftsInWallet, setNftsInWallet] = useState([]);
  const nftsListed = useGetAllListedNfts();
  const nftsByOwner = useGetNftsByOwner(account?.address);

  useEffect(() => {
    if (account && nftsByOwner) {
      setNftsInWallet(nftsByOwner);
    }
  }, [account, nftsByOwner]);

  if (!connected) {
    return <WalletSelector />;
  }

  return (
    <div className="min-h-screen bg-[#1a2436] text-white bg-[url('/wood-texture.jpg')] bg-repeat">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header - Styled as a wooden sign */}
        <div className="relative mb-8 bg-[#3d2b1f] rounded-lg p-6 border-4 border-[#2a1810] shadow-xl">
          <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#5c3c28] rounded-full border-2 border-[#2a1810]" />
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#5c3c28] rounded-full border-2 border-[#2a1810]" />
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span className="font-bold">Return to Ship</span>
            </button>

            {/* Currency Display - Styled as treasure chests */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-[#5c3c28] px-6 py-3 rounded-lg border-2 border-amber-600 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-amber-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3 6c0-1.1.9-2 2-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm2 0v12h14V6H5zm2 2h10v2H7V8zm0 4h10v2H7v-2z" />
                </svg>
                <span className="font-bold text-amber-400">1000 GAT</span>
              </div>
              <div className="flex items-center gap-2 bg-[#5c3c28] px-6 py-3 rounded-lg border-2 border-blue-600 shadow-inner">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <span className="font-bold text-blue-400">500 REP</span>
              </div>
              <WalletSelector />
            </div>
          </div>
        </div>

        {/* Navigation - Styled as parchment tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { icon: "🎴", label: "Trade Cards" },
            { icon: "💰", label: "Swap Treasures" },
            { icon: "📦", label: "Bundle Loot" },
          ].map((tab, index) => (
            <button
              key={index}
              className={`flex-1 py-3 px-4 rounded-t-lg font-pirate transition-all ${
                activeTab === ["nft", "tokens", "bundles"][index]
                  ? "bg-[#5c3c28] text-amber-400 border-2 border-b-0 border-amber-600 transform -translate-y-1"
                  : "bg-[#3d2b1f] text-gray-300 hover:bg-[#4a3327]"
              }`}
              onClick={() => setActiveTab(["nft", "tokens", "bundles"][index])}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className="block mt-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area - Styled as a wooden display case */}
        <div className="bg-[#3d2b1f] p-8 rounded-lg border-4 border-[#2a1810] shadow-xl">
          {activeTab === "nft" && (
            <>
              <h2 className="text-3xl font-bold mb-6 text-amber-400 border-b-2 border-amber-600 pb-2">
                🏴‍☠️ Available Treasures
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nftsListed && nftsListed?.length > 0 ? (
                  nftsListed.map((nft) => (
                    <NftCard key={nft.address} nft={nft}>
                      <Buy listing={nft} />
                    </NftCard>
                  ))
                ) : (
                  <p className="text-center text-gray-400 italic">
                    The merchant's shelves be empty...
                  </p>
                )}
              </div>

              <h2 className="text-3xl font-bold my-8 text-amber-400 border-b-2 border-amber-600 pb-2">
                🗝️ Your Collection
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nftsInWallet && nftsInWallet.length > 0 ? (
                  nftsInWallet.map((nft) => (
                    <NftCard key={nft.address} nft={nft}>
                      <List nftTokenObjectAddr={nft.address} />
                    </NftCard>
                  ))
                ) : (
                  <p className="text-center text-gray-400 italic">
                    Your treasure chest is empty, Captain...
                  </p>
                )}
              </div>
            </>
          )}

          {activeTab === "tokens" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  fromToken: "GAT",
                  toToken: "SST",
                  rate: "1:10",
                  icon: "🪙",
                },
                {
                  fromToken: "GAT",
                  toToken: "REP",
                  rate: "1:5",
                  icon: "💎",
                },
              ].map((swap, index) => (
                <div
                  key={index}
                  className="bg-[#5c3c28] rounded-lg overflow-hidden border-2 border-amber-600 shadow-lg"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{swap.icon}</span>
                      <h3 className="text-xl font-bold text-amber-400">
                        {swap.fromToken} ⇄ {swap.toToken}
                      </h3>
                    </div>
                    <div className="space-y-3 text-gray-300">
                      <p>Exchange Rate: {swap.rate}</p>
                      <div className="mt-6">
                        <button className="w-full bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-lg transition-colors">
                          Make the Trade
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "bundles" && (
            <div className="bg-[#5c3c28] rounded-lg border-2 border-amber-600 p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">📦</span>
                <h3 className="text-xl font-bold text-amber-400">
                  Bundle Your Treasures
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((slot) => (
                  <div
                    key={slot}
                    className="border-2 border-dashed border-amber-600/50 rounded-lg h-32 flex items-center justify-center hover:border-amber-400 transition-colors cursor-pointer bg-[#3d2b1f]"
                  >
                    <span className="text-4xl opacity-50">➕</span>
                  </div>
                ))}
              </div>
              <button className="w-full bg-amber-600 hover:bg-amber-500 text-white px-4 py-3 rounded-lg transition-colors">
                Forge Bundle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceView;
