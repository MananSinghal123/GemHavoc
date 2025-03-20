import { truncateAddress, useWallet } from "@aptos-labs/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { useGetCollectionData } from "../../hooks/useGetCollectionData";
import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { clampNumber } from "../../utils/clampNumber";
import { NETWORK } from "../../constants";
import { formatDate } from "../../utils/formatDate";
import { mintNFT } from "../../entry-functions/mint_nft";

export const Mint = () => {
  const { data } = useGetCollectionData();
  const queryClient = useQueryClient();
  const { account, signAndSubmitTransaction } = useWallet();
  const [nftCount, setNftCount] = useState(1);

  const { userMintBalance = 0, collection, totalMinted = 0, maxSupply = 1 } = data ?? {};
  const mintUpTo = Math.min(userMintBalance, maxSupply - totalMinted);

  console.log(collection);
  console.log("CollectionId", collection?.collection_id);

  const mintNft = async (e) => {
    e.preventDefault();
    if (!account || !data?.isMintActive) return;
    if (!collection?.collection_id) return;

    const response = await signAndSubmitTransaction(
      mintNFT({ collectionId: collection.collection_id, amount: nftCount }),
    );
    await aptosClient().waitForTransaction({ transactionHash: response.hash });
    queryClient.invalidateQueries();
    setNftCount(1);
  };

  return (
    <section className="px-4 max-w-screen-xl mx-auto w-full">
      <div className="bg-gradient-to-br from-[#3d1d15] to-[#240d08] rounded-lg border border-[#8b4513] p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/5 flex justify-center">
            <img
              src={collection?.cdn_asset_uris.cdn_image_uri ?? collection?.cdn_asset_uris.cdn_animation_uri}
              className="aspect-square object-cover rounded-lg border-2 border-[#ffd700] shadow-lg max-w-full h-auto"
            />
          </div>
          
          <div className="w-full md:w-3/5 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🏴‍☠️</span>
              <h1 className="text-2xl font-bold text-[#ffd700]">{collection?.collection_name}</h1>
            </div>
            
            <p className="text-[#e6c78b] mb-4">{collection?.description}</p>

            <div className="bg-black/30 rounded-lg border border-[#8b4513] p-4 mb-4">
              <form onSubmit={mintNft} className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="w-full md:w-1/3">
                    <Input
                      type="number"
                      disabled={!data?.isMintActive}
                      value={nftCount}
                      onChange={(e) => setNftCount(parseInt(e.currentTarget.value, 10))}
                      className="bg-black/50 border-[#8b4513] text-[#e6c78b] h-12 w-full"
                    />
                  </div>
                  <div className="w-full md:w-2/3">
                    <Button 
                      className="w-full bg-[#8b4513] hover:bg-[#cd7f32] text-white px-4 py-4 rounded-lg transition-colors font-bold text-lg border border-[#ffd700] h-12"
                      type="submit" 
                      disabled={!data?.isMintActive}
                    >
                      Claim Treasure
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="bg-black/20 rounded-lg p-3 border border-[#8b4513]/50">
                    <p className="text-[#ffd700] text-sm mb-1">Ye can claim up to</p>
                    <p className="text-white font-bold">{mintUpTo > 1 ? `${mintUpTo} Treasures` : `${mintUpTo} Treasure`}</p>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3 border border-[#8b4513]/50">
                    <p className="text-[#ffd700] text-sm mb-1">Treasure Map</p>
                    <p className="text-white font-bold">
                      {clampNumber(totalMinted)} / {clampNumber(maxSupply)} LOOTED
                    </p>
                    <div className="w-full bg-[#3d1d15] rounded-full h-2.5 mt-2">
                      <div 
                        className="bg-[#ffd700] h-2.5 rounded-full" 
                        style={{ width: `${(totalMinted / maxSupply) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-black/30 rounded-lg border border-[#8b4513] p-4">
              <div className="flex gap-x-2 items-center flex-wrap justify-between mb-3">
                <p className="whitespace-nowrap text-[#ffd700] font-semibold">Treasure Location</p>
                <div className="flex gap-x-2">
                  <AddressButton address={collection?.collection_id ?? ""} />
                  <a
                    className="text-[#e6c78b] hover:text-[#ffd700] underline flex items-center gap-1"
                    target="_blank"
                    href={`https://explorer.aptoslabs.com/object/${collection?.collection_id}?network=${NETWORK}`}
                  >
                    View on Map 🧭
                  </a>
                </div>
              </div>

              <div>
                {data?.startDate && new Date() < data.startDate && (
                  <div className="flex gap-x-2 justify-between flex-wrap text-[#e6c78b]">
                    <p className="font-semibold">Treasure Hunt Begins</p>
                    <p>{formatDate(data.startDate)}</p>
                  </div>
                )}

                {data?.endDate && new Date() < data.endDate && !data.isMintInfinite && (
                  <div className="flex gap-x-2 justify-between flex-wrap text-[#e6c78b]">
                    <p className="font-semibold">Treasure Hunt Ends</p>
                    <p>{formatDate(data.endDate)}</p>
                  </div>
                )}

                {data?.endDate && new Date() > data.endDate && 
                  <p className="font-semibold text-[#e6c78b]">The treasure hunt has ended!</p>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AddressButton = ({ address }) => {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    if (copied) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  return (
    <Button 
      onClick={onCopy} 
      className="text-[#ffd700] hover:text-[#e6c78b] flex gap-1 px-0 py-0" 
      variant="link"
    >
      {copied ? (
        "Treasure Map Copied!"
      ) : (
        <>
          {truncateAddress(address)}
          <span>📜</span>
        </>
      )}
    </Button>
  );
};