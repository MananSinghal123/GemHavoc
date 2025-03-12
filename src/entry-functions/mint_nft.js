import { MODULE_ADDRESS } from "../constants";

export const mintNFT = (args) => {
  const { collectionId, amount } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS}::launchpad::mint_nft`,
      typeArguments: [],
      functionArguments: [collectionId, amount],
    },
  };
};
