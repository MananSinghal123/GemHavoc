import React, { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { APT, APT_UNIT, aptos } from "../utils/aptos";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogCancel,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

const List = ({ nftTokenObjectAddr }) => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [price, setPrice] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onRefresh = () => {
    window.location.reload();
  };

  const onSubmit = async () => {
    if (!account) {
      throw new Error("Wallet not connected");
    }
    if (!price) {
      throw new Error("Price not set");
    }

    try {
      const response = await signAndSubmitTransaction({
        sender: account.address,
        data: {
          function: `${
            import.meta.env.VITE_MODULE_ADDRESS
          }::launchpad::list_with_fixed_price`,
          typeArguments: [APT],
          functionArguments: [nftTokenObjectAddr, parseInt(price) * APT_UNIT],
        },
      });

      await aptos.waitForTransaction({
        transactionHash: response.hash,
      });

      alert("Ye treasure be listed for all to see!");
      setIsDialogOpen(false);
      onRefresh();
    } catch (error) {
      console.error("Error listing NFT:", error);
      alert("Arrr! Failed to list yer treasure!");
    }
  };

  return (
    <div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="bg-amber-700 hover:bg-amber-600 text-white border-2 border-amber-900 px-6 py-2 rounded-md transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <span>🏴‍☠️</span>
            <span>Offer to Trade</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#3d2b1f] border-2 border-amber-900 text-amber-100 relative">
          {/* Decorative corners */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-amber-600 rounded-tl"></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-amber-600 rounded-tr"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-amber-600 rounded-bl"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-amber-600 rounded-br"></div>

          {/* Background texture */}
          <div className="absolute inset-0 bg-[url('/parchment-texture.jpg')] opacity-10 rounded-md"></div>

          <DialogHeader className="relative z-10">
            <DialogTitle className="py-5 text-2xl text-amber-400 flex items-center gap-3">
              <span>📜</span>
              <span>Set Yer Bounty Price</span>
            </DialogTitle>
            <div className="space-y-3 mt-2">
              <Label
                htmlFor="price"
                className="text-amber-300 flex items-center gap-2"
              >
                <span>💰</span>
                <span>Bounty in APT Doubloons</span>
              </Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter yer asking price"
                className="w-full bg-[#2a1810] border-amber-900 text-amber-200 placeholder-amber-700"
              />
            </div>
            <DialogDescription className="mt-4 text-amber-300/70 italic">
              Be sure of yer price, Cap'n! Once listed, this treasure will be
              visible to all scallywags in the seven seas!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="relative z-10 gap-2 mt-4">
            <DialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600">
              Retreat
            </DialogCancel>
            <Button
              onClick={onSubmit}
              className="bg-amber-700 hover:bg-amber-600 text-white border-2 border-amber-900"
            >
              Hoist the Jolly Roger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default List;
