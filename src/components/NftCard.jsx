import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "./ui/card";

const NftCard = ({ nft, children }) => {
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        if (!nft?.data?.uri) {
          throw new Error("No URI provided");
        }

        if (typeof nft.data.uri === "object" && nft.data.uri.image) {
          setMetadata(nft.data.uri);
          return;
        }

        const response = await fetch(nft.data.uri);
        const data = await response?.json();
        setMetadata(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching NFT metadata:", err);
      }
    };

    fetchMetadata();
  }, [nft]);

  if (error) return null;

  if (!metadata) {
    return (
      <Card className="animate-pulse p-4 bg-[#2a1810] border-2 border-amber-900">
        <div className="flex items-center space-x-4">
          <div className="h-6 w-32 bg-[#3d2b1f] rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative group">
      {/* Decorative corner elements */}
      <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-amber-600 rounded-tl"></div>
      <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-amber-600 rounded-tr"></div>
      <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-amber-600 rounded-bl"></div>
      <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-amber-600 rounded-br"></div>

      <Card className="bg-[#2a1810] border-2 border-amber-900 transform transition-all duration-300 hover:scale-102 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]">
        <CardHeader className="p-6 border-b border-amber-900/50 bg-[#3d2b1f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏴‍☠️</span>
              <h2 className="text-2xl font-bold text-amber-400">
                {metadata?.name}
              </h2>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Image Section with decorative frame */}
          <div className="relative p-2 bg-[#3d2b1f] rounded-lg border-2 border-amber-900">
            <div className="absolute inset-0 bg-[url('/wood-texture.jpg')] opacity-20 rounded-lg"></div>
            <img
              src={metadata?.image}
              alt={metadata?.name || "Pirate Treasure"}
              className="rounded-lg w-full h-64 object-cover"
            />
          </div>

          {/* Description Section styled as a worn parchment */}
          <div className="bg-[#3d2b1f] p-4 rounded-lg border-2 border-amber-900/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/parchment-texture.jpg')] opacity-10"></div>
            <h3 className="text-amber-400 mb-2 font-bold flex items-center gap-2">
              <span>📜</span> Tale of the Treasure
            </h3>
            <p className="text-amber-100/80 italic">{metadata?.description}</p>
          </div>

          {/* Attributes Grid styled as treasure chests */}
          <div className="grid grid-cols-2 gap-4">
            {metadata?.attributes &&
              Object.entries(metadata.attributes[0] || {}).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="bg-[#3d2b1f] p-4 rounded-lg border-2 border-amber-900/50 transform transition-all duration-200 hover:-translate-y-1"
                  >
                    <h3 className="text-amber-400/80 mb-1 text-sm flex items-center gap-2">
                      <span>💎</span> {key}
                    </h3>
                    <p className="text-white text-lg font-bold">{value}</p>
                  </div>
                )
              )}
          </div>

          {/* Action Buttons */}
          {children && (
            <div className="mt-6 flex justify-center">
              <div className="transform transition-all duration-200 hover:scale-105">
                {children}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NftCard;
