import {
  getAllListingObjectAddresses,
  getNft,
  getListingObjectAndSeller,
  getListingObjectPrice,
} from "../utils/aptos";
import { useEffect, useState } from "react";
import { useGetAllSellers } from "./useGetAllSellers";
// import { ListedAptogotchiWithTraits } from "@/utils/types";

export const useGetAllListedNfts = () => {
  const sellers = useGetAllSellers();
  const [nfts, setNfts] = useState();

  useEffect(() => {
    if (!sellers) return;
    (async () => {
      const nfts = [];
      for (const seller of sellers) {
        const listingObjectAddresses = await getAllListingObjectAddresses(
          seller
        );
        for (const listingObjectAddress of listingObjectAddresses) {
          const [nftAddress, sellerAddress] = await getListingObjectAndSeller(
            listingObjectAddress
          );
          const price = await getListingObjectPrice(listingObjectAddress);
          const nft = await getNft(nftAddress);

          nfts.push({
            ...nft,
            price,
            sellerAddress,
            listing_object_address: listingObjectAddress,
          });
        }
      }
      setNfts(nfts);
    })();
  }, [sellers]);
  return nfts;
};
