import { getUserOwnedNfts } from "../utils/aptos";
import { useEffect, useState } from "react";

export const useGetNftsByOwner = (ownerAddr) => {
  const [nfts, setNfts] = useState();
  useEffect(() => {
    if (!ownerAddr) return;
    getUserOwnedNfts(ownerAddr).then(async (res) => {
      console.log(res);
      const nfts = [];
      for (const nft of res) {
        nfts.push({
          ...nft,
          address: nft.token_data_id,
          data: {
            uri: nft.current_token_data?.token_uri,
          },
        });
      }
      setNfts(nfts);
      console.log("nfts", nfts);
    });
  }, [ownerAddr]);
  return nfts;
};
