import { convertAmountFromHumanReadableToOnChain } from "../utils/helpers";
import { MODULE_ADDRESS_TOKEN } from "../constants";

export const mintAsset = (args) => {
  const { assetType, amount, decimals } = args;
  return {
    data: {
      function: `${MODULE_ADDRESS_TOKEN}::launchpad::mint_fa`,
      typeArguments: [],
      functionArguments: [assetType, convertAmountFromHumanReadableToOnChain(amount, decimals)],
    },
  };
};