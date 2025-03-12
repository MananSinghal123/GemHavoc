import React, { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useGetNftsByOwner } from "../hooks/useGetNftsByOwner";
import { useGetAllListedNfts } from "../hooks/useGetAllListedNfts";
import NftCard from "./NftCard";
import Buy from "./Buy";
import List from "./List";
import { WalletSelector } from "./WalletSelector";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useGetAssetData } from "../hooks/useGetAssetData";
import { mintAsset } from "../entry-functions/mint_asset";
import { aptosClient } from "../utils/aptosClient";
import { useQueryClient } from "@tanstack/react-query";
import { useMultiplayerState } from "playroomkit";
import { Mint } from "./Mint";

const MarketplaceView = () => {
  const { data } = useGetAssetData();
  const [activeTab, setActiveTab] = useState("nft");
  const { connected, account, signAndSubmitTransaction } = useWallet();
  const [nftsInWallet, setNftsInWallet] = useState([]);
  const nftsListed = useGetAllListedNfts();
  const nftsByOwner = useGetNftsByOwner(account?.address);
  const [assetCount, setAssetCount] = useState("1");
  const [error, setError] = useState(null);
  const { asset, userMintBalance, yourBalance, maxSupply, currentSupply } = data ?? {};
  const queryClient = useQueryClient();
  const [gameScene, setGameScene] = useMultiplayerState("gameScene", "lobby");

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
    if (account && nftsByOwner) {
      setNftsInWallet(nftsByOwner);
    }
  }, [account, nftsByOwner]);

  if (!connected) {
    return <WalletSelector />;
  }

  return (
    
 <div className="bg-[#1a0f0b] text-white drop-shadow-xl fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col overflow-y-auto">
      {/* Top Navigation Bar */}
      <div className="bg-gradient-to-r from-[#2d1610] to-[#3d1d15] border-b-2 border-[#8b4513] shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setGameScene("lobby")}
            className="flex items-center gap-2 text-[#e6c78b] hover:text-[#ffd700] transition-colors"
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
            <span className="font-bold text-lg">Return to Ship</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#240d08] px-4 py-2 rounded-lg border border-[#cd7f32]">
              <img src={asset?.icon_uri} className="h-6 w-6" alt="Currency" />
              <span className="font-bold text-[#ffd700]">{yourBalance || 0} {asset?.symbol}</span>
            </div>
            <WalletSelector />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Main Tab Navigation */}
        <div className="mb-6 border-b border-[#5e2814]">
          <div className="flex -mb-px">
            {[
              { icon: "🎴", label: "Trade Cards" },
              { icon: "💰", label: "Get COINS" },
              { icon: "📦", label: "Bundle Loot" },
            ].map((tab, index) => (
              <button
                key={index}
                className={`px-6 py-3 font-bold text-lg transition-all flex items-center gap-2 ${
                  activeTab === ["nft", "tokens", "bundles"][index]
                    ? "border-b-2 border-[#cd7f32] text-[#ffd700]"
                    : "text-[#8b4513] hover:text-[#cd7f32]"
                }`}
                onClick={() => setActiveTab(["nft", "tokens", "bundles"][index])}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div>
          {activeTab === "nft" && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-[#ffd700] flex items-center gap-2">
                  <span className="text-2xl">🏴‍☠️</span> Available Treasures
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nftsListed && nftsListed?.length > 0 ? (
                    nftsListed.map((nft) => (
                      <div className="bg-gradient-to-b from-[#2d1610] to-[#1a0f0b] rounded-lg overflow-hidden border border-[#8b4513] shadow-lg transition-transform hover:scale-[1.02]">
                        <NftCard key={nft.address} nft={nft}>
                          <Buy listing={nft} />
                        </NftCard>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-10 text-center">
                      <div className="text-6xl mb-3">🏝️</div>
                      <p className="text-[#ffd700] text-xl mb-2">The merchant's shelves be empty, matey...</p>
                      <p className="text-[#cd7f32]">Check back later for more treasures</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4 text-[#ffd700] flex items-center gap-2">
                  <span className="text-2xl">🗝️</span> Your Collection
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {nftsInWallet && nftsInWallet.length > 0 ? (
                    nftsInWallet.map((nft) => (
                      <div className="bg-gradient-to-b from-[#2d1610] to-[#1a0f0b] rounded-lg overflow-hidden border border-[#8b4513] shadow-lg transition-transform hover:scale-[1.02]">
                        <NftCard key={nft.address} nft={nft}>
                          <List nftTokenObjectAddr={nft.address} />
                        </NftCard>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-10 text-center bg-[#240d08]/50 rounded-lg border border-[#5e2814]/50">
                      <div className="text-6xl mb-3">🧿</div>
                      <p className="text-[#ffd700] text-xl mb-2">Arr! Your treasure chest be empty, Captain...</p>
                      <p className="text-[#cd7f32]">Visit the market to acquire some treasures</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === "tokens" && (
            <>
              <h2 className="text-2xl font-bold mb-6 text-[#ffd700] flex items-center gap-2">
                <span className="text-2xl">💰</span> Mint New COINS
              </h2>
              
              <div className="bg-gradient-to-br from-[#3d1d15] to-[#240d08] rounded-lg border border-[#8b4513] p-6 mb-6 shadow-lg">
                {error && (
                  <div className="mb-6 bg-[#5c0b0b]/50 border border-[#8b0000] text-[#ff6b6b] p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 bg-black/30 p-5 rounded-lg border border-[#5e2814]">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🪙</span>
                      <h3 className="text-lg font-bold text-[#ffd700]">Mint Amount</h3>
                    </div>
                    
                    <form onSubmit={mintFA} className="flex flex-col gap-4">
                      <Input
                        type="text"
                        name="amount"
                        value={assetCount}
                        onChange={(e) => {
                          setAssetCount(e.target.value);
                        }}
                        className="bg-black/40 border-[#8b4513] text-[#ffd700] focus:ring-[#cd7f32] text-lg py-5"
                      />
                      <Button
                        type="submit"
                        className="bg-[#8b4513] hover:bg-[#cd7f32] text-white font-bold border border-[#ffd700] py-5 text-lg"
                      >
                        Mint {asset.name}
                      </Button>
                    </form>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between bg-black/30 p-5 rounded-lg border border-[#5e2814]">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={asset?.icon_uri}
                          className="h-6 w-6"
                          alt="Currency"
                        />
                        <h3 className="text-lg font-bold text-[#ffd700]">Available to Mint</h3>
                      </div>
                      <p className="text-[#e6c78b] text-2xl">
                        {Math.min(userMintBalance || 0, (maxSupply || 0) - (currentSupply || 0))} {asset?.symbol}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <img
                          src={asset?.icon_uri}
                          className="h-6 w-6"
                          alt="Currency"
                        />
                        <h3 className="text-lg font-bold text-[#ffd700]">Your Balance</h3>
                      </div>
                      <p className="text-[#e6c78b] text-2xl">
                        {yourBalance || 0} {asset?.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-[#3d1d15]/30 p-5 rounded-lg border border-[#5e2814]/50">
                <span className="text-3xl">💡</span>
                <p className="text-[#e6c78b]">
                  Mint new coins to add to your collection, then bet them with other sailors or use them for future upgrades!
                </p>
              </div>
            </>
          )}

          {activeTab === "bundles" && (
            <>
            <Mint/>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceView;