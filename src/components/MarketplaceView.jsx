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
import { CardContent,Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useGetAssetData } from "../hooks/useGetAssetData";
import { mintAsset } from "../entry-functions/mint_asset";
import { aptosClient } from "../utils/aptosClient";
import { useQueryClient } from "@tanstack/react-query";


const MarketplaceView = () => {
  const { data } = useGetAssetData();
  const [activeTab, setActiveTab] = useState("nft");
  const navigate = useNavigate();
  const { connected, network, account,signAndSubmitTransaction } = useWallet();
  const [nftsInWallet, setNftsInWallet] = useState([]);
  const nftsListed = useGetAllListedNfts();
  const nftsByOwner = useGetNftsByOwner(account?.address);
  const [assetCount, setAssetCount] = useState("1");
  const [error, setError] = useState(null);
  const { asset, userMintBalance , yourBalance , maxSupply, currentSupply  } = data ?? {};
  const queryClient = useQueryClient();


  const mintFA = async (e) => {
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

    const amount = parseFloat(assetCount);
    if (Number.isNaN(amount) || amount <= 0) {
      return setError("Invalid amount");
    }

    const response = await signAndSubmitTransaction(
      mintAsset({
        assetType: asset.asset_type,
        amount,
        decimals: asset.decimals,
      }),
    );
    await aptosClient().waitForTransaction({ transactionHash: response.hash });
    queryClient.invalidateQueries();
    setAssetCount("1");
  };


  useEffect(() => {
    console.log(yourBalance)
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
                <img
                  src={asset?.icon_uri }
                  className="h-6 w-6 text-amber-400"
                  rounded="full"
                  // viewBox="0 0 24 24"
                  // fill="currentColor"
                >
                </img>
                <span className="font-bold text-amber-400">{yourBalance} {asset?.symbol}</span>
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
            <>
              <h2 className="text-3xl font-bold mb-6 text-amber-400 border-b-2 border-amber-600 pb-2">
                💰 Mint New Treasures
              </h2>
              
              <div className="bg-[#5c3c28] rounded-lg border-2 border-amber-600 p-6 mb-6">
                {error && (
                  <div className="mb-4 bg-red-900/50 border border-red-700 text-red-200 p-3 rounded-lg">
                    {error}
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 bg-[#3d2b1f] p-4 rounded-lg border-2 border-[#2a1810] shadow-inner">
                    <div className="flex items-center gap-2 mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-amber-400"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      </svg>
                      <h3 className="text-lg font-bold text-amber-400">Mint Amount</h3>
                    </div>
                    
                    <form onSubmit={mintFA} className="flex gap-3">
                      <Input
                        type="text"
                        name="amount"
                        value={assetCount}
                        onChange={(e) => {
                          setAssetCount(e.target.value);
                        }}
                        className="bg-[#2a1810] border-amber-700 text-amber-200 focus:ring-amber-500"
                      />
                      <Button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold border-2 border-amber-700 px-6"
                      >
                        Mint
                      </Button>
                    </form>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between bg-[#3d2b1f] p-4 rounded-lg border-2 border-[#2a1810] shadow-inner">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                      <img
                  src={asset?.icon_uri }
                  className="h-6 w-6 text-amber-400"
                  rounded="full"
                  // viewBox="0 0 24 24"
                  // fill="currentColor"
                >
                </img>
                        <h3 className="text-lg font-bold text-amber-400">Available to Mint</h3>
                      </div>
                      <p className="text-amber-200 text-xl">
                        {Math.min(userMintBalance, maxSupply - currentSupply)} {asset?.symbol}
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                      <img
                  src={asset?.icon_uri }
                  className="h-6 w-6 text-amber-400"
                  rounded="full"
                  // viewBox="0 0 24 24"
                  // fill="currentColor"
                >
                </img>
                        <h3 className="text-lg font-bold text-amber-400">Your Balance</h3>
                      </div>
                      <p className="text-amber-200 text-xl">
                        {yourBalance} {asset?.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 bg-[#3d2b1f] p-4 rounded-lg border-2 border-[#2a1810] shadow-inner">
                <span className="text-3xl">💡</span>
                <p className="text-gray-300 italic">
                  Mint new treasures to add to your collection, then trade them with other sailors or use them for upgrades!
                </p>
              </div>
            </>
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